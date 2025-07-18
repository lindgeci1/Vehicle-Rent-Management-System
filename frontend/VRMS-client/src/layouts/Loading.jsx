import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-blue-gray-50 p-4">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        <div className="h-8 bg-blue-gray-200 rounded" />
        <div className="h-8 bg-blue-gray-200 rounded w-5/6" />
        <div className="h-8 bg-blue-gray-200 rounded w-4/6" />
        <div className="h-8 bg-blue-gray-200 rounded w-3/6" />
        <div className="h-8 bg-blue-gray-200 rounded w-2/6" />
      </div>
    </div>
  );
};

export default Loading;
