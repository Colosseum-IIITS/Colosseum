import clsx from "clsx";

const Button = ({
  id,
  title,
  rightIcon,
  leftIcon,
  containerClass,
  titleClass,
  loading = false
}) => {
  return (
    <button
      id={id}
      className={clsx(
        "group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full bg-violet-50 px-7 py-3 text-black",
        containerClass
      )}
      disabled={loading}
    >
      {leftIcon}

      <span className={clsx("relative inline-flex overflow-hidden font-general text-xs uppercase", titleClass)}>
        {/* Animated title */}
        <div className="translate-y-0 skew-y-0 transition duration-500 group-hover:translate-y-[-160%] group-hover:skew-y-12">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-4 border-t-4 border-gray-600 rounded-full"></div>
          ) : (
            title
          )}
        </div>
        <div className="absolute translate-y-[164%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          {loading ? (
            <div className="animate-spin w-4 h-4 border-4 border-t-4 border-gray-600 rounded-full"></div>
          ) : (
            title
          )}
        </div>
      </span>

      {rightIcon}
    </button>
  );
};

export default Button;
