export function BackgroundPapers() {
  return (
    <div className="absolute inset-0">
      {/* Paper 1 - Top left */}
      <div className="absolute top-8 left-12 w-32 h-40 bg-pink-100 rounded-lg shadow-md rotate-12 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-3/4 h-2 bg-purple-300 rounded"></div>
          <div className="w-full h-1 bg-purple-200 rounded"></div>
          <div className="w-2/3 h-1 bg-purple-200 rounded"></div>
          <div className="w-5/6 h-1 bg-purple-200 rounded"></div>
          <div className="w-1/2 h-1 bg-purple-200 rounded"></div>
        </div>
      </div>

      {/* Paper 2 - Top center */}
      <div className="absolute top-4 left-1/3 w-28 h-36 bg-yellow-100 rounded-lg shadow-md -rotate-6 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-4/5 h-2 bg-orange-300 rounded"></div>
          <div className="w-full h-1 bg-orange-200 rounded"></div>
          <div className="w-3/4 h-1 bg-orange-200 rounded"></div>
          <div className="w-2/3 h-1 bg-orange-200 rounded"></div>
        </div>
      </div>

      {/* Paper 3 - Top right */}
      <div className="absolute top-12 right-16 w-30 h-38 bg-blue-50 rounded-lg shadow-md rotate-8 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-3/4 h-2 bg-blue-300 rounded"></div>
          <div className="w-full h-1 bg-blue-200 rounded"></div>
          <div className="w-5/6 h-1 bg-blue-200 rounded"></div>
          <div className="w-2/3 h-1 bg-blue-200 rounded"></div>
        </div>
      </div>

      {/* Paper 4 - Middle left */}
      <div className="absolute top-1/2 left-8 w-28 h-36 bg-green-50 rounded-lg shadow-md -rotate-12 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-4/5 h-2 bg-green-300 rounded"></div>
          <div className="w-full h-1 bg-green-200 rounded"></div>
          <div className="w-3/4 h-1 bg-green-200 rounded"></div>
          <div className="w-2/3 h-1 bg-green-200 rounded"></div>
        </div>
      </div>

      {/* Paper 5 - Middle right */}
      <div className="absolute top-1/3 right-8 w-32 h-40 bg-purple-50 rounded-lg shadow-md rotate-15 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-3/4 h-2 bg-purple-300 rounded"></div>
          <div className="w-full h-1 bg-purple-200 rounded"></div>
          <div className="w-5/6 h-1 bg-purple-200 rounded"></div>
          <div className="w-2/3 h-1 bg-purple-200 rounded"></div>
        </div>
      </div>

      {/* Paper 6 - Bottom left */}
      <div className="absolute bottom-16 left-20 w-30 h-38 bg-orange-50 rounded-lg shadow-md rotate-6 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-4/5 h-2 bg-orange-300 rounded"></div>
          <div className="w-full h-1 bg-orange-200 rounded"></div>
          <div className="w-3/4 h-1 bg-orange-200 rounded"></div>
        </div>
      </div>

      {/* Paper 7 - Bottom right */}
      <div className="absolute bottom-12 right-24 w-28 h-36 bg-teal-50 rounded-lg shadow-md -rotate-8 border border-gray-200 p-3">
        <div className="space-y-1">
          <div className="w-3/4 h-2 bg-teal-300 rounded"></div>
          <div className="w-full h-1 bg-teal-200 rounded"></div>
          <div className="w-2/3 h-1 bg-teal-200 rounded"></div>
        </div>
      </div>

      {/* Additional scattered papers */}
      <div className="absolute top-1/4 left-1/4 w-24 h-32 bg-red-50 rounded-lg shadow-md rotate-45 border border-gray-200 p-2">
        <div className="space-y-1">
          <div className="w-3/4 h-1 bg-red-200 rounded"></div>
          <div className="w-full h-1 bg-red-200 rounded"></div>
          <div className="w-2/3 h-1 bg-red-200 rounded"></div>
        </div>
      </div>

      <div className="absolute bottom-1/3 right-1/3 w-26 h-34 bg-indigo-50 rounded-lg shadow-md -rotate-20 border border-gray-200 p-2">
        <div className="space-y-1">
          <div className="w-4/5 h-1 bg-indigo-200 rounded"></div>
          <div className="w-full h-1 bg-indigo-200 rounded"></div>
          <div className="w-3/4 h-1 bg-indigo-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}