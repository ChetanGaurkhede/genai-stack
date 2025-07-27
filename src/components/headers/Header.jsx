import React from "react";
import { Trash2 } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200 p-4 fixed top-0 left-0 w-full z-50">
      <div className="flex items-center justify-between">
        <h3>GenAI Stack</h3>
        <div className="flex items-center gap-2">
          <button
            // onClick={clearWorkflow}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
