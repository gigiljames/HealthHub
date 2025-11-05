import getIcon from "../../helpers/getIcon";

function ULandingPage() {
  document.title = "HealthHub";
  return (
    <>
      <div className="sticky z-1 top-0 h-[70px] bg-transparent bg-lightGreen flex items-center px-5 lg:px-20 justify-between border-b-1 border-b-gray-200">
        <a href="/">
          <img
            src="/Logo_with_text_black.png"
            className="h-[50px] cursor-pointer"
          />
        </a>
        <div className="md:flex gap-6 hidden  text-gray-400">
          <a
            href="/doctor"
            className="flex items-center hover:underline hover:text-black"
          >
            For Doctors
          </a>
          <a
            href="/hospital"
            className="flex items-center hover:underline hover:text-black"
          >
            For Hospitals
          </a>
          <a
            href="/auth"
            className="border-2 border-lightGreen px-4 py-2 rounded-md text-lightGreen font-bold hover:bg-lightGreen hover:text-white transition-all duration-200 active:scale-95"
          >
            Login/Signup
          </a>
        </div>
        <div className="md:hidden">
          {getIcon("burger-menu", "35px", "black")}
        </div>
      </div>
      {/* <section className="px-4 py-4">
        <div className="bg-lightGreen">
          <p>Search for doctors, hospitals</p>
          <div>
            <input />
          </div>
        </div>
      </section> */}
      {/* <div className="h-screen overflow-hidden relative flex flex-col justify-center -translate-y-[70px]">
        <div className="z-1">
          <p>The Future of Connected Care.</p>
          <p>Seamless collaboration between patients, doctors, and labs.</p>
        </div>
        <video muted loop className="absolute top-0 hidden lg:block ">
          <source src="/user-hero-video.mp4" />
        </video>
        <video muted loop className=" absolute top-0 lg:hidden object-fill">
          <source src="/user-hero-video-phone.mp4" />
        </video>
      </div> */}
    </>
  );
}

export default ULandingPage;
