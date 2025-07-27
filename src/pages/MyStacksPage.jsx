import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Play, MessageCircle, Plus } from "lucide-react";
import ComponentLibrary from "../components/ComponentLibrary";
import ChatInterface from "../components/chatbox/ChatInterface";
import UserQueryNode from "../components/stack-models/UserQuery";
import LLMEngineNode from "../components/stack-models/LLMEngine";
import KnowledgeBaseNode from "../components/stack-models/KnowledgeBase";
import OutputNode from "../components/stack-models/Output";
import { useStackData } from "../context/stackAiContext";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Node types
const nodeTypes = {
  userQuery: UserQueryNode,
  knowledgeBase: KnowledgeBaseNode,
  llmEngine: LLMEngineNode,
  outPut: OutputNode,
};

// Main App Component
export default function WorkflowBuilders() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const location = useLocation();

  const { stackData, updateStack } = useStackData();
  const [allStack, setAllStacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/workflows/"
        );
        setAllStacks(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch workflows:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const segments = path.split("/");
    const isBuilderRoute = segments[1] === "builder";
    const builderId = isBuilderRoute ? segments[2] : null;

    if (builderId && allStack.length > 0) {
      const matched = allStack.find(
        (stack) => String(stack.id) === String(builderId)
      );

      if (matched) {
        updateStack(matched);
      } else {
        console.warn("⚠️ Stack not found for ID:", builderId);
      }
    }
  }, [location.pathname, allStack]);
  useEffect(() => console.log("stackData: ", stackData), []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = (rfi) => setReactFlowInstance(rfi);

  const onAddNode = useCallback(
    (type) => {
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: { label: type },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onUpdateNode = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const validateWorkflow = () => {
    // Basic validation logic
    const hasUserQuery = nodes.some((node) => node.type === "userQuery");
    const hasOutput = nodes.some((node) => node.type === "output");

    if (!hasUserQuery || !hasOutput) {
      alert("Workflow must have at least a User Query and Output component");
      return false;
    }

    if (edges.length === 0) {
      alert("Components must be connected");
      return false;
    }

    return true;
  };

  const buildStack = () => {
    if (!validateWorkflow()) return;

    // Save workflow logic here
    console.log("Building stack...", { nodes, edges });
    alert("Stack built successfully! You can now chat with it.");
  };

  const clearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-1 mt-16">
        {/* Component Library */}
        <ComponentLibrary
          onAddNode={onAddNode}
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          {/* ReactFlow Canvas */}
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
            >
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={true}
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px",
                  background: "white",
                  padding: "2px 10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
              />

              {/* <MiniMap /> */}
              <Background variant="dots" gap={12} size={1} />

              {nodes.length === 0 && (
                <Panel position="center">
                  <div className="text-center text-gray-500 bg-white p-4 rounded-lg shadow-sm border">
                    <div className="mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-md font-medium text-gray-800 mb-2">
                        Drag & drop to get started
                      </h3>
                    </div>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        workflowId="current-workflow"
      />

      <div className="flex flex-col items-center justify-center fixed bottom-10 right-5 p-4 space-y-2 z-50">
        <div className="rounded-full bg-green-700 p-3 shadow-md flex items-center gap-2 hover:bg-green-800 transition duration-200 ease-in-out transform hover:scale-110">
          <Play className="w-4 h-4 text-white" onClick={buildStack} />
        </div>
        <div className="rounded-full bg-blue-700 p-3 shadow-md flex items-center gap-2 hover:bg-blue-800 transition duration-200 ease-in-out transform hover:scale-110">
          <MessageCircle
            className="w-4 h-4 text-white"
            onClick={() => setIsChatOpen(true)}
          />
        </div>
      </div>
    </div>
  );
}
