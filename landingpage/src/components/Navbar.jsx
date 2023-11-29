import { useState } from "react";
import { close, logo, menu } from "../assets";
import { navLinks } from "../constants";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  return (
    <nav
      className="w-full flex items-center navbar fixed top-0 left-0 z-50 shadow-md"
      style={{
        height: "60px",
        paddingRight: "1rem",
        paddingLeft: "1rem",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <Link to="/home">
        <img src={logo} alt="hoobank" className="w-[150px] h-[50]" />
      </Link>

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-poppins font-normal cursor-pointer text-[16px] ${
              active === nav.title ? "text-white" : "text-dimWhite"
            } ${nav.title === "Login" ? "login-link" : ""} ${
              index === navLinks.length - 1 ? "mr-0" : "mr-10"
            }`}
            onClick={() => setActive(nav.title)}
          >
            {nav.href ? (
              <a href={nav.href} target="_blank" rel="noopener noreferrer">
                {nav.title}
              </a>
            ) : (
              <Link to={nav.path}>{nav.title}</Link>
            )}
          </li>
        ))}
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain"
          onClick={() => setToggle(!toggle)}
        />

        <div
          className={`${
            !toggle ? "hidden" : "flex"
          } p-6 bg-black-gradient absolute top-20 right-20 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col">
            {navLinks.map((nav, index) => (
              <li
                key={nav.id}
                className={`font-poppins font-medium cursor-pointer text-[16px] ${
                  active === nav.title ? "text-white" : "text-dimWhite"
                } ${index === navLinks.length - 1 ? "mb-0" : "mb-4"}`}
                onClick={() => setActive(nav.title)}
              >
                {nav.href ? (
                  <a href={nav.href} target="_blank" rel="noopener noreferrer">
                    {nav.title}
                  </a>
                ) : (
                  <Link to={nav.path}>{nav.title}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
