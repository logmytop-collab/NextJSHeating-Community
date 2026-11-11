export const renderModalDiv = (title: any, child: any, closeAction: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          closeAction();
        }}
      />

      {/* Modal */}
      <div className="relative z-10 max-w-md min-w-[300px] rounded-lg bg-white p-2 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => {
              closeAction();
            }}
            className="rounded px-2 py-1 top-4 right-4 hover:bg-gray-100 "
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between">{child}</div>
      </div>
    </div>
  );
};
