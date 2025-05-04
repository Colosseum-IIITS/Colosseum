import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { TiLocationArrow } from "react-icons/ti";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ src, title, description, onClick }) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  return (
    <div className="relative size-full" onClick={onClick}>
      <video
        src={src}
        loop
        muted
        autoPlay
        className="absolute left-0 top-0 size-full object-cover object-center"
      />
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const router = useRouter(); // Initialize useRouter

  return (
    <section className="bg-black pb-52" id="features">
      <div className="container mx-auto px-3 md:px-10">
        <div className="px-5 py-32">
          <p className="font-circular-web text-lg text-blue-50">
            Colosseum: Where Legends Are Made
          </p>
          <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
            Whether you are a serious gamer, or a casual player. A gaming club or an institution, the colosseum is where you belong.
          </p>
        </div>

        <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
          <BentoCard
            src="videos/feature-1.mp4"
            title={
              <>
                Game Ag<b>n</b>ostic
              </>
            }
            description="The platform is game agnostic, if a player's performance can be quantified, a tournament can be hosted"
          />
        </BentoTilt>

        <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
          <BentoTilt
            className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2 cursor-pointer"
             // Redirect to player
          >
            <BentoCard
              src="videos/feature-2.mp4"
              title={<>pl<b>ay</b>er</>}
              onClick={() => router.push("/auth?role=player")}
              description="No matter who you are, you can climb the ranks at colosseum and claim your spot at the top of the world"
            />
          </BentoTilt>

          <BentoTilt
            className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0 cursor-pointer"
            // Redirect to organiser
          >
            <BentoCard
              src="videos/feature-3.mp4"
              title={<>or<b>ga</b>nis<b>ers</b></>}
              onClick={() => router.push("/auth?role=organiser")}
              description="Buddies or professional gamers, team up with your mates and synchronize your plays"
            />
          </BentoTilt>

          <BentoTilt
            className="bento-tilt_1 me-14 md:col-span-1 md:me-0 cursor-pointer" // Redirect to admin
          >
            <BentoCard
              src="videos/feature-4.mp4"
              title={<>ad<b>m</b>in</>}
              onClick={() => router.push("/auth?role=admin")}
              description="The team of overseers, working to ensure your experience is as smooth as can be."
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <div className="flex size-full flex-col justify-between bg-violet-300 p-5">
              <h1 className="bento-title special-font max-w-64 text-black">
                M<b>o</b>re co<b>m</b>ing s<b>o</b>on.
              </h1>

              <TiLocationArrow className="m-5 scale-[5] self-end" />
            </div>
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <video
              src="videos/feature-5.mp4"
              loop
              muted
              autoPlay
              className="size-full object-cover object-center"
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;