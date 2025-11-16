import React, { useState } from "react";
import "./SingleScreen.css";





import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function SingleScreen() {
  const [leftWidth, setLeftWidth] = useState(50);
  const [rightWidth, setRightWidth] = useState(50);
  const [leftScale, setLeftScale] = useState(1);
  const [rightScale, setRightScale] = useState(1);
  const [leftImageHeight, setLeftImageHeight] = useState("65%");
  const [rightImageHeight, setRightImageHeight] = useState("65%");
  const [isLeftButtonVisible, setIsLeftButtonVisible] = useState(false);
  const [isRightButtonVisible, setIsRightButtonVisible] = useState(false);
  const [isMouseMoveEnabled, setIsMouseMoveEnabled] = useState(true);
  const [isRightContentVisible, setIsRightContentVisible] = useState(true);
  const [hideImg, setHideImg] = useState(true);
  const [hideLeftImg, setHideLeftImg] = useState(true);
  const [newst, setNewst] = useState(false);
  const [isRightSectionHidden, setIsRightSectionHidden] = useState(false);
  const [isLeftSectionHidden, setIsLeftSectionHidden] = useState(false);

  // Function to handle mouse movement
  const handleMouseMove = (event) => {
    if (!isMouseMoveEnabled) return;

    const screenWidth = window.innerWidth;
    const cursorX = event.clientX;
    const cursorPercent = (cursorX / screenWidth) * 100;

    if (cursorPercent <= 40) {
      setLeftWidth(65);
      setRightWidth(35);
      setLeftScale(1.4);
      setRightScale(1);
      setLeftImageHeight("65%");
      setRightImageHeight("38%");
    } else if (cursorPercent >= 72) {
      setLeftWidth(35);
      setRightWidth(65);
      setLeftScale(1);
      setRightScale(1.4);
      setLeftImageHeight("38%");
      setRightImageHeight("77%");
    } else {
      setLeftWidth(50);
      setRightWidth(50);
      setLeftScale(1.1);
      setRightScale(1.1);
      setLeftImageHeight("65%");
      setRightImageHeight("65%");
    }
  };

  // Handle "left" button click
  const handleMouseMoveLeft = () => {
    setLeftWidth(90);
    setRightWidth(10);
    setLeftScale(1.6);
    setRightScale(1);
    setLeftImageHeight("85%");
    setIsLeftButtonVisible(true);
    setIsRightContentVisible(false); // Hide right content with sliding effect
    setIsMouseMoveEnabled(false);
    setHideLeftImg(false);
    setIsRightSectionHidden(true);
  };

  // Handle "right" button click
  const handleMouseMoveRight = () => {
    setLeftWidth(10);
    setRightWidth(90);
    setLeftScale(1);
    setRightScale(1.3);
    setLeftImageHeight("38%");
    setRightImageHeight("75%");
    setIsRightButtonVisible(true);
    setIsLeftButtonVisible(false);
    setIsRightContentVisible(true);
    setIsMouseMoveEnabled(false);
    setHideImg(false);
    setNewst(true);
    setIsLeftSectionHidden(true);
  };

  // Handle "back" button click to reset
  const handleBackClick = () => {
    setLeftWidth(50);
    setRightWidth(50);
    setLeftScale(1);
    setRightScale(1);
    setLeftImageHeight("65%");
    setRightImageHeight("65%");
    setIsLeftButtonVisible(false);
    // setIsRightButtonVisible(false);
    setIsRightContentVisible(true); // Show right content
    setIsMouseMoveEnabled(true);
    setHideLeftImg(true);
    setIsRightSectionHidden(false);
  };

  const handleBackRightClick = () => {
    setLeftWidth(50);
    setRightWidth(50);
    setLeftScale(1);
    setRightScale(1);
    setLeftImageHeight("65%");
    setRightImageHeight("65%");
    setIsRightButtonVisible(false);
    setIsRightContentVisible(true); // Show right content
    setIsMouseMoveEnabled(true);
    setHideLeftImg(true);
    setNewst(false);
    setIsLeftSectionHidden(false);
  };

  return (
    <>
      <div className="containerx">
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100vh",
            transition: "all 1.5s ease-in-out",
          }}
          onMouseMove={handleMouseMove}
        >
          <div
            className="left-section"
            style={{
              width: `${leftWidth}%`,
            }}
          >
            {!isLeftSectionHidden && (
              <>
                <div
                  style={{
                    transform: `scale(${leftScale})`,
                    transformOrigin: "top left",
                    transition: "all 1.2s ease",
                    marginTop: "5rem",
                    paddingLeft: "3rem",
                    zIndex: "10",
                  }}
                >
                  {(isLeftButtonVisible || isRightButtonVisible) && (
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                      onClick={handleBackClick}
                    >
                      <img src="/arrowBackBlack.svg" width={22} height={10} className="me-3" alt="" />
                      Back
                    </div>
                  )}
                  <div>
                    <h2
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginLeft: "6px",
                      }}
                    >
                      For Renters
                    </h2>
                    <h2
                      style={{ fontSize: "36px", fontWeight: "900" }}
                      className="italic"
                    >
                      Find the Perfect AC <br /> for Your Comfort <br />{" "}
                      Today
                    </h2>
                    <p style={{ fontSize: "12px", fontWeight: "400" }}>
                      Browse through our wide selection of ACs, <br />
                      choose your preferred model, and enjoy cool comfort.
                    </p>
                  </div>
                  <Link to="/browse">
                    <button className="left-button bg-primary-blue text-white w-[120px]">
                      Browse ACs
                    </button>
                  </Link>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: "2rem",
                    height: leftImageHeight,
                    transform: `scale(${leftScale})`,
                    transformOrigin: "top right",
                    transition: "all 1.2s ease",
                  }}
                >
                  <img
                    src="/acbanner.jfif"
                    alt=""
                    className="left-image mt-6"
                    style={{
                      width: "100%",
                      height: "100%",
                      transformOrigin: "bottom left",
                      transition: "transform 1.2s ease",
                    }}
                  />
                </div>

                {!isLeftButtonVisible && !isRightButtonVisible && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50%",
                      right: "0.5rem",
                      cursor: "pointer",
                      opacity: isLeftButtonVisible ? 0 : 1,
                      transition: "opacity 1.2s ease",
                      zIndex: "10",
                    }}
                    onClick={handleMouseMoveLeft}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                )}
              </>
            )}
          </div>

          <div
            // className="right-section"
            className="right-section rightt"
            style={{
              width: `${rightWidth}%`,
            }}
          >
            {!isRightSectionHidden && (
              <>
                {!isRightButtonVisible && !isLeftButtonVisible && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50%",
                      left: "0.5rem",
                      cursor: "pointer",
                      opacity: isRightButtonVisible ? 0 : 1,
                      transition: "opacity 1.2s ease",
                      zIndex: "10",
                    }}
                    onClick={handleMouseMoveRight}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
                <div
                  className={`${newst ? "right-section-to" : ""}`}
                  style={{
                    // marginTop: "5rem",
                    paddingLeft: "5rem",
                    transform: `scale(${rightScale})`,
                    zIndex: "10",

                    // transform: `scale(${rightScale}) ${
                    //   !isRightContentVisible ? "translateX(100%)" : "translateX(0)"
                    // }`, // Slide out to the right
                    // height: rightImageHeight,
                    // transition: "transform 1.2s ease",
                    // transformOrigin: "top",

                    marginTop: "5rem",
                    height: "75%",
                    transition: "transform 1.2s ease-in-out",
                    // transform: "scale(1.3)",

                    transformOrigin: "top left",
                  }}
                >
                  {isRightButtonVisible && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        maxWidth: "maxContent",
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}
                      onClick={handleBackRightClick}
                    >
                      <img height={10} width={22} src="/arrowBackWhite.svg" className="me-3" alt="" />
                      Back
                    </span>
                  )}
                  <h2 style={{ fontSize: "12px", fontWeight: "600" }}>
                    For Service
                  </h2>
                  <h2
                    style={{ fontSize: "36px", fontWeight: "900" }}
                    className="italic"
                  >
                    Get Your AC <br /> Repaired & Serviced <br /> Today
                  </h2>
                  <p style={{ fontSize: "12px", fontWeight: "400" }}>
                    Need AC repair or maintenance? Book a service <br /> request easily and get professional <br /> technicians at your doorstep!
                  </p>
                  <Link to="/service-request">
                    <button className="right-button bg-[#fff] text-primary-blue w-[120px]">
                      Service Request
                    </button>
                  </Link>
                </div>
                {hideLeftImg && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: "2rem",
                      height: rightImageHeight,
                      transform: `scale(${rightScale})`,
                      transformOrigin: "top right",
                      transition: "all 1.2s ease",
                    }}
                  >
                    {/* <img
                      src="/acinstaller.jpg"
                      alt=""
                      className="right-image mt-16"
                      style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "bottom left",
                        transition: "transform 1.2s ease",
                      }}
                    /> */}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="containery h-[100%]">
        <div className="top-section  flex flex-col justify-between">
          <div className="p-4 mt-10">
            <p className="text-xs">For Renters</p>
            <h1 className="italic text-xl">
              {" "}
              Find the Perfect AC <br /> for Your Comfort <br /> Today
            </h1>
            <p className="text-sm mt-2">
              Browse through our wide selection of ACs, choose your preferred model, and enjoy cool comfort.
            </p>
            <Link to="/browse">
              <button
                className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ minWidth: '140px' }}
              >
                Browse ACs
              </button>
            </Link>
          </div>
          <div className="flex justify-end">
            <img
              className="h-[200px] w-[150px] "
              src="acbanner.jfif"
              alt="man"
            />
          </div>
        </div>
        <div className="top-section bg-[#2563EB] text-white flex flex-col justify-between">
          <div className="p-4 mt-5">
            <p className="text-xs">For Service</p>
            <h1 className="italic text-xl">
              {" "}
              Get Your AC <br /> Repaired & Serviced <br /> Today
            </h1>
            <p className="text-sm mt-2">
              Need AC repair or maintenance? Book a service request easily and get professional technicians at your doorstep.
            </p>

            <Link to="/service-request">
              <button
                className="mt-3 px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ minWidth: '140px' }}
              >
                Service Request
              </button>
            </Link>
          </div>
          <div className="flex justify-end">
            {/* <img className="h-[200px] w-[150px]" src="/acinstaller.jpg" alt="man" /> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleScreen;
