import React from "react";

interface LoginPageProps {
  onLogin?: (...args: any[]) => any;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <main
      className="
        min-h-[100dvh]
        w-full
        overflow-x-hidden
        bg-slate-950
        text-slate-100
        px-3
        py-4
        sm:px-6
        sm:py-6
        md:px-8
        lg:px-10
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          max-w-md
          lg:max-w-6xl
          mx-auto
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            overflow-hidden
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/80
            shadow-2xl
            backdrop-blur-xl
          "
        >
          {/* BRAND / INFORMATION PANEL */}

          <section
            className="
              hidden
              lg:flex
              flex-col
              justify-between
              min-h-[620px]
              p-10
              xl:p-14
              bg-gradient-to-br
              from-slate-950
              via-slate-900
              to-blue-950/40
              border-r
              border-slate-800
            "
          >
            <div>
              <div
                className="
                  inline-flex
                  items-center
                  justify-center
                  h-12
                  w-12
                  rounded-xl
                  bg-blue-600/15
                  border
                  border-blue-500/30
                  mb-6
                "
              >
                <span className="text-xl font-bold text-blue-400">
                  E
                </span>
              </div>

              <h1
                className="
                  text-3xl
                  xl:text-4xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Ecorp Academy
              </h1>

              <p
                className="
                  mt-4
                  max-w-lg
                  text-base
                  xl:text-lg
                  leading-7
                  text-slate-400
                "
              >
                Learn. Practice. Build. Prove your skills.
              </p>
            </div>

            <div className="space-y-4">
              <div
                className="
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/60
                  p-4
                "
              >
                <p className="text-sm font-medium text-slate-200">
                  Hands-on learning
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Practice real-world skills through guided challenges,
                  AI-assisted learning and practical assessments.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900/50
                    p-4
                    text-center
                  "
                >
                  <div className="text-lg font-bold text-white">
                    AI
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Learning
                  </div>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900/50
                    p-4
                    text-center
                  "
                >
                  <div className="text-lg font-bold text-white">
                    Labs
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Practice
                  </div>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900/50
                    p-4
                    text-center
                  "
                >
                  <div className="text-lg font-bold text-white">
                    Skills
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Evidence
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LOGIN PANEL */}

          <section
            className="
              w-full
              min-w-0
              p-5
              sm:p-7
              md:p-8
              lg:p-10
              flex
              flex-col
              justify-center
            "
          >
            {/* Mobile brand */}

            <div className="mb-7 text-center lg:hidden">
              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-500/30
                  bg-blue-600/15
                "
              >
                <span className="text-xl font-bold text-blue-400">
                  E
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Ecorp Academy
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  sm:text-base
                  text-slate-400
                "
              >
                Learn. Practice. Build. Prove.
              </p>
            </div>

            {/* Heading */}

            <div className="mb-6">
              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-semibold
                  text-white
                "
              >
                Welcome back
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-400
                "
              >
                Sign in to continue your learning journey.
              </p>
            </div>

            {/* AUTHENTICATION AREA */}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onLogin?.("google")}
                className="
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  text-sm
                  font-medium
                  text-slate-100
                  transition
                  hover:bg-slate-800
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-950
                "
              >
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => onLogin?.("github")}
                className="
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  px-4
                  text-sm
                  font-medium
                  text-slate-100
                  transition
                  hover:bg-slate-800
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-950
                "
              >
                Continue with GitHub
              </button>
            </div>

            {/* DIVIDER */}

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />

              <span
                className="
                  shrink-0
                  text-xs
                  text-slate-500
                "
              >
                OR
              </span>

              <div className="h-px flex-1 bg-slate-800" />
            </div>

            {/* EMAIL */}

            <form
              onSubmit={(event) => {
                event.preventDefault();
                onLogin?.("email");
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="
                    block
                    min-h-[48px]
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    text-base
                    text-white
                    placeholder:text-slate-600
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-300
                  "
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="
                    block
                    min-h-[48px]
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-950
                    px-4
                    text-base
                    text-white
                    placeholder:text-slate-600
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                  "
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-950/30
                  transition
                  hover:bg-blue-500
                  active:scale-[0.99]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-950
                "
              >
                Sign in
              </button>
            </form>

            {/* FOOTER */}

            <div
              className="
                mt-7
                text-center
                text-xs
                leading-5
                text-slate-500
              "
            >
              By continuing, you agree to the platform's terms
              and acknowledge the privacy policy.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;