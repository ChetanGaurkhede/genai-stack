import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ExternalLink, Loader } from "lucide-react";
import CreateStack from "../components/CreateStack";
import { useStackData } from "../context/stackAiContext";
import axios from "axios";

const MyStacksPage = () => {
  const navigate = useNavigate();

  const { stacks, setStacks, updateStack, loading, setLoading } =
    useStackData();
  const [workflows, setWorkflows] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const handleCreateStack = (newStack) => {
    const id = Date.now().toString(); // mock id
    setStacks([...stacks, { id, ...newStack }]);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/workflows/"
      );
      setStacks(response.data);
      console.log("Fetched workflows:", response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []); // ← run only once on mount

  const handleEdit = (stackId) => {
    const currentStack = stacks.find((stack) => stack.id === stackId);
    if (currentStack) {
      updateStack(currentStack);
      navigate(`/builder/${stackId}`);
    } else {
      console.warn(`Stack with ID ${stackId} not found`);
    }
  };

  if(loading){
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader className="animate-spin h-5 w-5" />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white p-8 pt-22">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Stacks</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow cursor-pointer"
          >
            <PlusCircle size={18} />
            New Stack
          </button>
        </div>

        {stacks.length === 0 ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="text-center border border-gray-200 p-10 rounded-md shadow-sm">
              <h2 className="text-lg font-medium mb-2">Create New Stack</h2>
              <p className="text-gray-500 mb-4">
                Start building your generative AI apps with our essential tools
                and frameworks.
              </p>
              <button
                onClick={handleCreateStack}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                + New Stack
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stacks.map((stack) => (
              <div
                key={stack.id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-1">{stack.name}</h3>
                <p className="text-gray-500 text-sm mb-3">
                  {stack.description}
                </p>
                <button
                  onClick={() => handleEdit(stack.id)}
                  className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100"
                >
                  Edit Stack <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateStack
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateStack}
      />
    </>
  );
};

export default MyStacksPage;
