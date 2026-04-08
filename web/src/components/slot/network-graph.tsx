"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface Action {
  agent_name: string;
  agent_id?: number;
  action_type: string;
  platform: string;
  round_num?: number;
  action_args?: Record<string, unknown>;
  success?: boolean;
}

interface AgentNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  actionCount: number;
  platforms: Record<string, number>;
  interactionTypes: Record<string, number>;
  connections: number;
  color: string;
}

interface AgentLink extends d3.SimulationLinkDatum<AgentNode> {
  weight: number;
  types: Record<string, number>;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  twitter: "#0A0A0A",
  reddit: "#FF6B1A",
  polymarket: "#43C165",
};

function buildNetworkData(actions: Action[], maxRound: number) {
  const filtered = maxRound > 0
    ? actions.filter((a) => (a.round_num || 0) <= maxRound)
    : actions;

  const agentMap: Record<string, AgentNode> = {};
  const edgeMap: Record<string, AgentLink> = {};

  // Build agent nodes
  for (const a of filtered) {
    if (!a.agent_name) continue;
    if (!agentMap[a.agent_name]) {
      agentMap[a.agent_name] = {
        id: a.agent_name,
        name: a.agent_name,
        actionCount: 0,
        platforms: {},
        interactionTypes: {},
        connections: 0,
        color: "#7A7A7A",
      };
    }
    const agent = agentMap[a.agent_name];
    agent.actionCount++;
    agent.platforms[a.platform] = (agent.platforms[a.platform] || 0) + 1;
    const label = a.action_type?.replace(/_/g, " ").toLowerCase() || "unknown";
    agent.interactionTypes[label] = (agent.interactionTypes[label] || 0) + 1;
  }

  // Build edges from interactions
  for (const a of filtered) {
    if (!a.agent_name) continue;
    const src = a.agent_name;
    let target: string | null = null;
    const args = a.action_args || {};

    if (a.action_type === "CREATE_COMMENT" && args.post_author_name) target = args.post_author_name as string;
    else if (a.action_type === "LIKE_POST" && args.post_author_name) target = args.post_author_name as string;
    else if (a.action_type === "SAVE_POST" && args.post_author_name) target = args.post_author_name as string;
    else if (a.action_type === "SHARE_POST" && args.post_author_name) target = args.post_author_name as string;
    else if (a.action_type === "REPOST" && args.original_author_name) target = args.original_author_name as string;
    else if (a.action_type === "REPOST_FEED" && args.post_author_name) target = args.post_author_name as string;
    else if (a.action_type === "FOLLOW" && args.target_user_name) target = args.target_user_name as string;
    else if (a.action_type === "LIKE_COMMENT" && args.comment_author_name) target = args.comment_author_name as string;

    if (target && target !== src && agentMap[target]) {
      const key = [src, target].sort().join("|||");
      if (!edgeMap[key]) {
        edgeMap[key] = { source: src, target, weight: 0, types: {} };
      }
      edgeMap[key].weight++;
      const typeKey = a.action_type?.replace(/_/g, " ").toLowerCase() || "unknown";
      edgeMap[key].types[typeKey] = (edgeMap[key].types[typeKey] || 0) + 1;
    }
  }

  // Count connections and assign colors
  const edges = Object.values(edgeMap);
  for (const e of edges) {
    const src = typeof e.source === "string" ? e.source : (e.source as AgentNode).id;
    const tgt = typeof e.target === "string" ? e.target : (e.target as AgentNode).id;
    if (agentMap[src]) agentMap[src].connections++;
    if (agentMap[tgt]) agentMap[tgt].connections++;
  }

  const nodes = Object.values(agentMap);
  for (const n of nodes) {
    let maxP = "";
    let maxC = 0;
    for (const [p, c] of Object.entries(n.platforms)) {
      if (c > maxC) { maxC = c; maxP = p; }
    }
    n.color = PLATFORM_COLORS[maxP] || "#7A7A7A";
  }

  return { nodes, edges };
}

export function NetworkGraph({
  railwayUrl,
  simulationId,
  isRunning,
}: {
  railwayUrl: string;
  simulationId: string;
  isRunning: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRound, setMaxRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 450 });
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulationRef = useRef<d3.Simulation<AgentNode, AgentLink> | null>(null);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Fetch actions
  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch(`${railwayUrl}/api/simulation/${simulationId}/actions?limit=5000`);
      const data = await res.json();
      const acts: Action[] = Array.isArray(data) ? data : (data.actions || data.data || []);
      setActions(acts);
      const rounds = acts.map((a) => a.round_num || 0);
      setMaxRound(rounds.length > 0 ? Math.max(...rounds) : 0);
    } catch { /* keep trying */ }
  }, [railwayUrl, simulationId]);

  // Poll while running
  useEffect(() => {
    fetchActions();
    if (!isRunning) return;
    const timer = setInterval(fetchActions, 5000);
    return () => clearInterval(timer);
  }, [isRunning, fetchActions]);

  // Render D3
  useEffect(() => {
    if (!svgRef.current || actions.length === 0) return;

    let cleanup: (() => void) | undefined;
    try {
    const { width, height } = dimensions;
    const { nodes, edges } = buildNetworkData(actions, currentRound);
    if (nodes.length === 0) return;

    if (simulationRef.current) simulationRef.current.stop();

    const maxActions = Math.max(...nodes.map((n) => n.actionCount), 1);
    const radiusScale = d3.scaleSqrt().domain([1, maxActions]).range([5, 20]);
    const maxWeight = Math.max(...edges.map((e) => e.weight), 1);
    const widthScale = d3.scaleLinear().domain([1, maxWeight]).range([1, 5]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.2, 4])
        .on("zoom", (event) => g.attr("transform", event.transform))
    );

    const sim = d3
      .forceSimulation<AgentNode>(nodes)
      .force("link", d3.forceLink<AgentNode, AgentLink>(edges).id((d) => d.id).distance(90))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<AgentNode>().radius((d) => radiusScale(d.actionCount) + 3));

    simulationRef.current = sim;

    const link = g.append("g").selectAll("line").data(edges).join("line")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => widthScale(d.weight));

    const nodeG = g.append("g").selectAll("g").data(nodes).join("g")
      .style("cursor", "pointer")
      .on("click", (event, d) => { event.stopPropagation(); setSelectedAgent(d); });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodeG.call(d3.drag<SVGGElement, AgentNode>()
      .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }) as any);

    nodeG.append("circle")
      .attr("r", (d) => radiusScale(d.actionCount))
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeG.append("text")
      .text((d) => d.name.length > 12 ? d.name.substring(0, 12) + "..." : d.name)
      .attr("font-size", "8px")
      .attr("fill", "#64748b")
      .attr("dx", (d) => radiusScale(d.actionCount) + 4)
      .attr("dy", 3)
      .style("pointer-events", "none");

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as AgentNode).x!)
        .attr("y1", (d) => (d.source as AgentNode).y!)
        .attr("x2", (d) => (d.target as AgentNode).x!)
        .attr("y2", (d) => (d.target as AgentNode).y!);
      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    svg.on("click", () => setSelectedAgent(null));

    cleanup = () => { sim.stop(); };
    } catch (err) {
      console.error("[NetworkGraph] D3 error:", err);
    }
    return cleanup;
  }, [actions, currentRound, dimensions]);

  // Play/pause
  const playPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playTimerRef.current) { clearInterval(playTimerRef.current); playTimerRef.current = null; }
      return;
    }
    if (currentRound >= maxRound) setCurrentRound(0);
    setIsPlaying(true);
    playTimerRef.current = setInterval(() => {
      setCurrentRound((r) => {
        if (r >= maxRound) {
          setIsPlaying(false);
          if (playTimerRef.current) clearInterval(playTimerRef.current);
          return r;
        }
        return r + 1;
      });
    }, 800);
  };

  useEffect(() => {
    return () => { if (playTimerRef.current) clearInterval(playTimerRef.current); };
  }, []);

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-purple-100 bg-white p-6 text-center text-gray-400">
        <div className="animate-pulse text-2xl mb-2">&#9672;</div>
        Esperando interacciones de agentes...
      </div>
    );
  }

  const stats = buildNetworkData(actions, currentRound);

  return (
    <div className="rounded-xl border border-purple-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-50 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">Red de Interacciones</h4>
          <p className="text-xs text-gray-400">
            {stats.nodes.length} agentes &middot; {stats.edges.length} conexiones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
            <div key={platform} className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {platform === "instagram" ? "IG" : platform}
            </div>
          ))}
        </div>
      </div>

      {/* Round scrubber */}
      {maxRound > 0 && (
        <div className="px-4 py-2 border-b border-purple-50 flex items-center gap-3">
          <button
            onClick={playPause}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <input
            type="range"
            min={0}
            max={maxRound}
            value={currentRound}
            onChange={(e) => {
              setIsPlaying(false);
              if (playTimerRef.current) { clearInterval(playTimerRef.current); playTimerRef.current = null; }
              setCurrentRound(Number(e.target.value));
            }}
            className="flex-1 accent-purple-600"
          />
          <span className="text-xs text-gray-500 font-mono w-16 text-right">
            {currentRound === 0 ? "TODAS" : `R${currentRound}/${maxRound}`}
          </span>
        </div>
      )}

      <div className="flex">
        {/* Graph */}
        <div ref={containerRef} className="flex-1" style={{ minHeight: 420 }}>
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />
        </div>

        {/* Agent detail */}
        {selectedAgent && (
          <div className="w-64 border-l border-purple-50 p-4 space-y-3 overflow-y-auto max-h-[420px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: selectedAgent.color }}
                >
                  {selectedAgent.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedAgent.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedAgent.actionCount} acciones &middot; {selectedAgent.connections} conexiones
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase text-gray-400">Plataformas</p>
              {Object.entries(selectedAgent.platforms).map(([platform, count]) => (
                <div key={platform} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] || "#999" }} />
                  <span className="text-gray-600 flex-1">{platform}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / selectedAgent.actionCount) * 100}%`,
                        backgroundColor: PLATFORM_COLORS[platform] || "#999",
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-mono w-6 text-right">{count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-gray-400">Tipos de accion</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(selectedAgent.interactionTypes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs">
                      {type} <strong>{count}</strong>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-purple-50 text-xs text-gray-400">
        Tamano nodo = actividad &middot; Grosor linea = interacciones &middot; Arrastra nodos &middot; Scroll para zoom
      </div>
    </div>
  );
}
