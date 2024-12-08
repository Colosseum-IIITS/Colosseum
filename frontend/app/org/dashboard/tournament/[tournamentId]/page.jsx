// app/org/dashboard/tournament/[tournamentId]/page.jsx

import TournamentEdit from '@/components/TournamentEdit';

const TournamentPage = async ({ params }) => {
    // Await the params object (if necessary based on your Next.js version)
    // In some Next.js configurations, params might need to be awaited
    // Here, we ensure compatibility by handling it as an asynchronous operation
    const { tournamentId } = await params;

    // Log the tournamentId for debugging (server-side)
    console.log('Tournament ID:', tournamentId);

    return <TournamentEdit tournamentId={tournamentId} />;
};

export default TournamentPage;
