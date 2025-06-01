import { ScheduleSelection } from "~/components/schedule/schedule-selection";

export default function Route({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl">
        <main className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <ScheduleSelection scheduleId={id} />
        </main>
      </div>
    </div>
  );
}
