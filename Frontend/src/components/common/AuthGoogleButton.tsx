import { FcGoogle } from "react-icons/fc";

interface AuthGoogleButtonProps {
  title: string;
}

function AuthGoogleButton({ title }: AuthGoogleButtonProps) {
  return (
    <>
      <div className="w-full p-3 border-1 border-black rounded-xl flex justify-around items-center h-[50px] cursor-pointer">
        <div className="flex items-center gap-2 font-semibold text-sm md:text-[16px]">
          <FcGoogle size={28} />
          {title || ""}
        </div>
      </div>
    </>
  );
}

export default AuthGoogleButton;

// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [],
//   theme: {
//     extend: {
//       colors: {
//         lightGreen: "rgba(var(--lightGreen))",
//       },
//     },
//   },
// };

// export default config;
