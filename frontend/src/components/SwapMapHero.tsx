import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface Person {
  id: string;
  name: string;
  avatarUrl: string;
  currentLocation: string;
  newLocation: string;
  startPos: Position;
  targetPos: Position;
}

interface Doctor {
  id: string;
  location: string;
  pos: Position;
  avatarUrl: string;
}

const SwapMapHero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const animationStartRef = useRef(Date.now());
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [animProgress, setAnimProgress] = useState(0);

  const ANIMATION_DURATION = 8000; // 8 seconds
  const TOTAL_CYCLE = 10000; // 10 seconds total (includes pause)

  // Example data - using relative positions (0-1) for responsive design
  const doctors: Doctor[] = [
    {
      id: "doc1",
      location: "Zwolle",
      pos: { x: 0.5, y: 0.15 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-groningen",
    },
    {
      id: "doc2",
      location: "Utrecht",
      pos: { x: 0.55, y: 0.35 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-zwolle",
    },
    {
      id: "doc3",
      location: "Rotterdam",
      pos: { x: 0.3, y: 0.6 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-denhaag",
    },
    {
      id: "doc4",
      location: "Haarlem",
      pos: { x: 0.45, y: 0.1 },
      avatarUrl: "https://avatar.iran.liara.run/public?username=doc-leeuwarden",
    },
  ];

  const people: Person[] = [
    {
      id: "p1",
      name: "Henk",
      avatarUrl: "https://avatar.iran.liara.run/public/boy?username=Henk",
      currentLocation: "Zwolle",
      newLocation: "Utrecht",
      startPos: { x: 0.5, y: 0.15 },
      targetPos: { x: 0.55, y: 0.35 },
      currentPos: { x: 0.5, y: 0.15 },
    },
    {
      id: "p2",
      name: "Maria",
      avatarUrl: "https://avatar.iran.liara.run/public/girl?username=Maria",
      currentLocation: "Utrecht",
      newLocation: "Rotterdam",
      startPos: { x: 0.55, y: 0.35 },
      targetPos: { x: 0.3, y: 0.6 },
      currentPos: { x: 0.55, y: 0.35 },
    },
    {
      id: "p3",
      name: "Frank",
      avatarUrl: "https://avatar.iran.liara.run/public?username=Frank",
      currentLocation: "Rotterdam",
      newLocation: "Haarlem",
      startPos: { x: 0.3, y: 0.6 },
      targetPos: { x: 0.45, y: 0.1 },
      currentPos: { x: 0.3, y: 0.6 },
    },
    {
      id: "p4",
      name: "Anne",
      avatarUrl: "https://avatar.iran.liara.run/public/girl?username=Anne",
      currentLocation: "Haarlem",
      newLocation: "Zwolle",
      startPos: { x: 0.45, y: 0.1 },
      targetPos: { x: 0.5, y: 0.15 },
      currentPos: { x: 0.45, y: 0.1 },
    },
  ];

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const drawLines = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;

    people.forEach((person) => {
      const easeProgress = easeInOutCubic(progress);
      const currentX =
        person.startPos.x +
        (person.targetPos.x - person.startPos.x) * easeProgress;
      const currentY =
        person.startPos.y +
        (person.targetPos.y - person.startPos.y) * easeProgress;

      const startX = currentX * width;
      const startY = currentY * height;

      const doctor = doctors.find((d) => d.location === person.newLocation);
      if (!doctor) return;

      const endX = doctor.pos.x * width;
      const endY = doctor.pos.y * height;

      // Calculate opacity based on animation phase
      let opacity = 0;
      if (progress < 0.2) {
        // Fade in phase
        opacity = progress / 0.2;
      } else if (progress < 0.8) {
        // Visible phase
        opacity = 1;
      } else {
        // Fade out phase
        opacity = Math.max(0, 1 - (progress - 0.8) / 0.2);
      }

      // Draw curved line (quadratic Bezier)
      ctx.strokeStyle = `rgba(79, 172, 254, ${opacity * 0.6})`; // light blue
      ctx.lineWidth = 2 * dpr;
      ctx.lineCap = "round";

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const offsetX = (endY - startY) * 0.1;
      const offsetY = (startX - endX) * 0.1;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, endX, endY);
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(endY - startY, endX - startX);
      const arrowSize = 8 * dpr;

      ctx.fillStyle = `rgba(79, 172, 254, ${opacity * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6),
      );
      ctx.fill();
    });
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const now = Date.now();
    const elapsed = (now - animationStartRef.current) % TOTAL_CYCLE;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // Update state to trigger re-render
    setAnimProgress(progress);

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawLines(ctx, width, height, progress);

    animationRef.current = requestAnimationFrame(animate);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (contextRef.current) {
      contextRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    contextRef.current = canvas.getContext("2d");
    resizeCanvas();
    animate();

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        resizeCanvas();
        animate();
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div className="relative w-full h-[60vh] bg-linear-to-r from-sky-200 via-sky-200 to-teal-200">
      {/* Background map */}
      <div
        className="absolute inset-0"
        style={{
          background: 'url("/nlmap.svg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
        }}
      />

      {/* Canvas for animated lines */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: "block" }}
      />

      {/* Doctors (fixed positions) */}
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="absolute"
          style={{
            left: `${doctor.pos.x * 100}%`,
            top: `${doctor.pos.y * 100}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <Avatar className="w-12 h-12 border-2 border-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200">
              <AvatarImage
                src={doctor.avatarUrl}
                alt={`Doctor at ${doctor.location}`}
              />
            </Avatar>
            <div className="text-xs font-semibold text-slate-700 bg-white bg-opacity-80 px-2 py-0.5 rounded">
              {doctor.location}
            </div>
          </div>
        </div>
      ))}

      {/* People (animated positions) */}
      {people.map((person) => {
        const easeProgress = easeInOutCubic(animProgress);
        const currentX =
          person.startPos.x +
          (person.targetPos.x - person.startPos.x) * easeProgress;
        const currentY =
          person.startPos.y +
          (person.targetPos.y - person.startPos.y) * easeProgress;

        let labelOpacity = 0;
        if (animProgress > 0.2 && animProgress < 0.8) {
          labelOpacity = Math.min(
            (animProgress - 0.2) / 0.2,
            (0.8 - animProgress) / 0.2,
          );
        }

        return (
          <div
            key={person.id}
            className="absolute"
            style={{
              left: "0",
              top: "0",
              transform: `translate(calc(${currentX * 100}% - 50%), calc(${currentY * 100}% - 50%))`,
              zIndex: 20,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-16 h-16 border-3 border-white shadow-lg">
                <AvatarImage src={person.avatarUrl} alt={person.name} />
              </Avatar>

              {/* Animated label */}
              <div
                className="text-center text-xs font-semibold text-slate-700 bg-white bg-opacity-90 px-3 py-1 rounded-full whitespace-nowrap"
                style={{
                  opacity: labelOpacity,
                }}
              >
                <div>{person.name}</div>
                <div className="text-blue-600">naar {person.newLocation}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SwapMapHero;
