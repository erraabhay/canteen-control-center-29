
export const LoadingView = () => {
  return (
    <div className="container flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading menu...</p>
      </div>
    </div>
  );
};
