import { ScheduleSelection } from "~/components/schedule/schedule-selection";

export default function Route({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <main className="container mx-auto py-8 px-4">
      <ScheduleSelection scheduleId={id} />
    </main>
  );
}
