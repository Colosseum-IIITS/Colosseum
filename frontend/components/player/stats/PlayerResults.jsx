const PlayerResult = ({ player }) => (
    <div className="border-b p-4">
      <h3 className="font-semibold">{player.name}</h3>
      <p>{player.position}</p>
    </div>
  );
  
  export default PlayerResult;
  