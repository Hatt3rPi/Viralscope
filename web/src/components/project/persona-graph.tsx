"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Persona {
  user_id: number;
  name: string;
  display_name?: string;
  age?: number;
  gender?: string;
  profession?: string;
  country?: string;
  city?: string;
  interested_topics?: string[];
  stance?: string;
  description?: string;
  user_profile?: string;
  bio?: string;
  follower_count?: number;
  mbti?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  persona: Persona;
  label: string;
  stance: string;
  group: string;
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  sharedTopics: string[];
  weight: number;
}

const STANCE_COLORS: Record<string, string> = {
  supportive: "#22c55e",
  neutral: "#a78bfa",
  skeptical: "#f97316",
  opposing: "#ef4444",
};

const STANCE_LABELS: Record<string, string> = {
  supportive: "Afin",
  neutral: "Neutral",
  skeptical: "Escéptico",
  opposing: "Opuesto",
};

function buildGraph(personas: Persona[]) {
  const nodes: GraphNode[] = personas.map((p, i) => ({
    id: p.user_id ?? i,
    persona: p,
    label: p.display_name || p.name || `Agent ${i}`,
    stance: p.stance || "neutral",
    group: p.stance || "neutral",
    radius: 6 + Math.min((p.follower_count || 150) / 50, 12),
  }));

  // Build edges from shared interests (at least 2 in common)
  const links: GraphLink[] = [];
  for (let i = 0; i < personas.length; i++) {
    const topicsA = new Set(personas[i].interested_topics || []);
    for (let j = i + 1; j < personas.length; j++) {
      const topicsB = personas[j].interested_topics || [];
      const shared = topicsB.filter((t) => topicsA.has(t));
      if (shared.length >= 2) {
        links.push({
          source: nodes[i].id,
          target: nodes[j].id,
          sharedTopics: shared,
          weight: shared.length,
        });
      }
    }
  }

  return { nodes, links };
}

export function PersonaGraph({ personas }: { personas: Persona[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Persona | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // D3 force simulation
  useEffect(() => {
    if (!svgRef.current || personas.length === 0) return;

    const { width, height } = dimensions;
    const { nodes, links } = buildGraph(personas);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(80)
          .strength((d) => d.weight * 0.1)
      )
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => d.radius + 4));

    // Links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.min(d.weight, 4));

    // Nodes
    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => STANCE_COLORS[d.stance] || "#a78bfa")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .on("click", (_event, d) => setSelected(d.persona));

    // Apply drag behavior (cast needed for D3 type compatibility)
    const dragBehavior = d3
      .drag<SVGCircleElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.call(dragBehavior as any);

    // Labels
    const labels = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.label.split(".")[0].split("_")[0])
      .attr("font-size", "9px")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 12)
      .attr("pointer-events", "none");

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);
      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [personas, dimensions]);

  // Stance stats
  const stanceCounts: Record<string, number> = {};
  for (const p of personas) {
    const s = p.stance || "neutral";
    stanceCounts[s] = (stanceCounts[s] || 0) + 1;
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          {Object.entries(stanceCounts).map(([stance, count]) => (
            <div key={stance} className="flex items-center gap-1.5 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STANCE_COLORS[stance] || "#a78bfa" }}
              />
              <span className="text-gray-600">
                {STANCE_LABELS[stance] || stance}
              </span>
              <span className="text-gray-400 font-mono text-xs">{count}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-400">
          {personas.length} personas &middot; click para detalles &middot;
          arrastra nodos &middot; scroll para zoom
        </span>
      </div>

      <div className="flex gap-4">
        {/* Graph */}
        <div
          ref={containerRef}
          className="flex-1 bg-white rounded-xl border border-purple-100 overflow-hidden"
          style={{ minHeight: 480 }}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 bg-white rounded-xl border border-purple-100 p-4 space-y-3 overflow-y-auto max-h-[520px]">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">
                {selected.display_name || selected.name}
              </h4>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{
                backgroundColor:
                  STANCE_COLORS[selected.stance || "neutral"] || "#a78bfa",
              }}
            >
              {STANCE_LABELS[selected.stance || "neutral"] || selected.stance}
            </div>

            <div className="space-y-1.5 text-sm">
              {selected.age && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Edad</span>
                  <span className="text-gray-800">{selected.age}</span>
                </div>
              )}
              {selected.gender && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Genero</span>
                  <span className="text-gray-800">{selected.gender}</span>
                </div>
              )}
              {selected.profession && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Profesion</span>
                  <span className="text-gray-800 text-right max-w-[160px]">
                    {selected.profession}
                  </span>
                </div>
              )}
              {(selected.city || selected.country) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ubicacion</span>
                  <span className="text-gray-800">
                    {[selected.city, selected.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {selected.mbti && (
                <div className="flex justify-between">
                  <span className="text-gray-500">MBTI</span>
                  <span className="text-gray-800 font-mono">
                    {selected.mbti}
                  </span>
                </div>
              )}
            </div>

            {selected.interested_topics &&
              selected.interested_topics.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Intereses</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.interested_topics.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selected.bio && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Bio</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.bio}
                </p>
              </div>
            )}

            {selected.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Descripcion</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selected.description}
                </p>
              </div>
            )}

            {selected.user_profile && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Perfil</p>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selected.user_profile}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
