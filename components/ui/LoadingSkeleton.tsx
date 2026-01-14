export default function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-[40px] p-8 border-2 border-gray-100 animate-pulse"
        >
          <div className="flex gap-8">
            {/* 左側 */}
            <div className="w-1/3 space-y-4">
              <div className="h-4 w-16 bg-gray-200 rounded-full" />
              <div className="h-8 w-3/4 bg-gray-200 rounded-2xl" />
              <div className="h-6 w-24 bg-gray-200 rounded-xl" />
              <div className="space-y-2 mt-4">
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>

            {/* 右側 */}
            <div className="flex-1 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded-xl" />
              <div className="p-4 bg-gray-100 rounded-2xl space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-5/6 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
