export default function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-card-light dark:bg-card-dark aspect-[2/3] rounded-lg"></div>
      <div className="bg-card-light dark:bg-card-dark h-4 mt-2 rounded w-3/4"></div>
    </div>
  );
}