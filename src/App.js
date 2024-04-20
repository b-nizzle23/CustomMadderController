import {Box} from "@mui/material";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

const MAX_JOYSTICK_DISTANCE = 70;

function App() {
    // my custom button
    const [buttonCenter, setbuttonCenter] = useState({x: 0, y: 0});
    const buttonCenterRef = useRef(buttonCenter);
    const [buttonState, setButtonState] = useState(null);
    const buttonStateRef = useRef(buttonState);


    const [joystickCenter, setJoystickCenter] = useState({x: 0, y: 0});
    const joystickCenterRef = useRef(joystickCenter);
    const [circleCenter, setCircleCenter] = useState({x: 0, y: 0});
    const circleCenterRef = useRef(circleCenter);
    const [triangleCenter, setTriangleCenter] = useState({x: 0, y: 0});
    const triangleCenterRef = useRef(triangleCenter);
    const [homeCenter, setHomeCenter] = useState({x: 0, y: 0});
    const homeCenterRef = useRef(homeCenter);
    const [plusCenter, setPlusCenter] = useState({x: 0, y: 0});
    const plusCenterRef = useRef(plusCenter);

    const [joystickState, setJoystickState] = useState({x: 0, y: 0, id: null});
    const joystickStateRef = useRef(joystickState);
    const [circleState, setCircleState] = useState(null);
    const circleStateRef = useRef(circleState);
    const [triangleState, setTriangleState] = useState(null);
    const triangleStateRef = useRef(triangleState);
    const [homeState, setHomeState] = useState(null);
    const homeStateRef = useRef(homeState);
    const [plusState, setPlusState] = useState(null);
    const plusStateRef = useRef(plusState);

    const [playerName, setPlayerName] = useState('');

    function sendMessageToParent(message) {
        // print statement debugging
        console.log(message)
        if(window.ReactNativeWebView){
            window.ReactNativeWebView.postMessage(message);
        }

        if(window.parent){
            window.parent.postMessage(message, "*");
        }
    }

    function handleMessageFromParent(event) {
        const msg = event.data;
        if (msg.name === 'vibrate') {
            sendMessageToParent(JSON.stringify({name: 'vibrate'}))
        }
        else if (msg.name === 'exit') {
            sendMessageToParent(JSON.stringify({name: 'exit'}));
        }
        else if (msg.name === 'name') {
            setPlayerName(msg.player);
        }
    }

    const joystickTopLeft = useMemo(() => {
        const top = 67 - (joystickState.y / 100 * MAX_JOYSTICK_DISTANCE);
        const left = 67 + (joystickState.x / 100 * MAX_JOYSTICK_DISTANCE);
        return { top, left };
    }, [joystickState]);

    const memoizedSetCenters = useCallback(() => setCenters(), []);
    const memoizedTouchStart = useCallback((e) => onTouchStart(e), []);
    const memoizedTouchMove = useCallback((e) => onTouchMove(e), []);
    const memoizedTouchEnd = useCallback((e) => onTouchEnd(e), []);

    useEffect(() => {
        const handleResize = () => {
            memoizedSetCenters();
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("orientationchange", handleResize);
        window.addEventListener('message', handleMessageFromParent);

        sendMessageToParent(JSON.stringify({name: 'ready'}));

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("orientationchange", handleResize);
            window.removeEventListener('message', handleMessageFromParent);
        }
    }, []);

    useEffect(() => {
        const controllerState = {
            name: playerName,
            joystick: {
                x: joystickState.x,
                y: joystickState.y,
            },
            circle: circleState !== null,
            triangle: triangleState !== null,
            button: buttonState !== null,
            plus: plusState !== null,
        }
        sendMessageToParent(JSON.stringify({name: 'controller-state', state: JSON.stringify(controllerState)}));
    }, [joystickState, circleState, triangleState, plusState, buttonState]);

    const setCenters = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        setJoystickCenter({x: 200, y: screenHeight - 195});
        joystickCenterRef.current = {x: 200, y: screenHeight - 195};
        setCircleCenter({x: screenWidth - 266, y: screenHeight - 129});
        circleCenterRef.current = {x: screenWidth - 266, y: screenHeight - 129};
        setTriangleCenter({x: screenWidth - 134, y: screenHeight - 261});
        triangleCenterRef.current = {x: screenWidth - 134, y: screenHeight - 261};
        setHomeCenter({x: screenWidth / 2, y: screenHeight - 227.27});
        homeCenterRef.current = {x: screenWidth / 2, y: screenHeight - 227.27};
        setPlusCenter({x: screenWidth / 2, y: screenHeight - 163.09});
        plusCenterRef.current = {x: screenWidth / 2, y: screenHeight - 163.09};

        setbuttonCenter({x: screenWidth - 200, y: screenHeight - 245});
        buttonCenterRef.current = {x: screenWidth - 200, y: screenHeight - 245};
    }

    const onTouchStart = (e) => {
        e.preventDefault();
        const {pointerId, clientX, clientY} = e;
        if (joystickStateRef.current.id === null) {
            if (Math.sqrt(Math.pow(clientX - joystickCenterRef.current.x, 2) + Math.pow(clientY - joystickCenterRef.current.y, 2)) <= 70) {
                setJoystickState({x: Math.round((clientX - joystickCenterRef.current.x) / MAX_JOYSTICK_DISTANCE * 100), y: Math.round((joystickCenterRef.current.y - clientY) / 137 * 100), id: pointerId});
                joystickStateRef.current = {x: Math.round((clientX - joystickCenterRef.current.x) / MAX_JOYSTICK_DISTANCE * 100), y: Math.round((joystickCenterRef.current.y - clientY) / 137 * 100), id: pointerId};
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
        }
        if (circleStateRef.current === null) {
            if (Math.sqrt(Math.pow(clientX - circleCenterRef.current.x, 2) + Math.pow(clientY - circleCenterRef.current.y, 2)) <= 71) {
                setCircleState(pointerId);
                circleStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
        }
        // new button stuffs
        if (buttonStateRef.current === null) {
            if (Math.sqrt(Math.pow(clientX - buttonCenterRef.current.x, 2) + Math.pow(clientY - buttonCenterRef.current.y, 2)) <= 71) {
                setButtonState(pointerId);
                buttonStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
        }
        if (triangleStateRef.current === null) {
            if (Math.sqrt(Math.pow(clientX - triangleCenterRef.current.x, 2) + Math.pow(clientY - triangleCenterRef.current.y, 2)) <= 71) {
                setTriangleState(pointerId);
                triangleStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
        }
        if (homeStateRef.current === null) {
            if (Math.sqrt(Math.pow(clientX - homeCenterRef.current.x, 2) + Math.pow(clientY - homeCenterRef.current.y, 2)) <= 23) {
                setHomeState(pointerId);
                homeStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
            }
        }
        if (plusStateRef.current === null) {
            if (Math.sqrt(Math.pow(clientX - plusCenterRef.current.x, 2) + Math.pow(clientY - plusCenterRef.current.y, 2)) <= 23) {
                setPlusState(pointerId);
                plusStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
            }
        }
    }

    const onTouchMove = (e) => {
        e.preventDefault();
        const {pointerId, clientX, clientY} = e;
        if (joystickStateRef.current.id === pointerId) {
            const x = (clientX - joystickCenterRef.current.x);
            const y = (joystickCenterRef.current.y - clientY);
            const angle = Math.atan2(y, x);
            const distance = Math.min(50, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
            const newX = Math.round(Math.cos(angle) * distance / 50 * 100);
            const newY = Math.round(Math.sin(angle) * distance / 50 * 100);
            setJoystickState({x: newX, y: newY, id: pointerId});
            joystickStateRef.current = {x: newX, y: newY, id: pointerId};
        }
        else {
            if (circleStateRef.current === pointerId && Math.sqrt(Math.pow(clientX - circleCenterRef.current.x, 2) + Math.pow(clientY - circleCenterRef.current.y, 2)) > 71) {
                setCircleState(null);
                circleStateRef.current = null;
            } else if (circleStateRef.current === null && Math.sqrt(Math.pow(clientX - circleCenterRef.current.x, 2) + Math.pow(clientY - circleCenterRef.current.y, 2)) <= 71) {
                setCircleState(pointerId);
                circleStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
            // new button stuffs
            if (buttonStateRef.current === pointerId && Math.sqrt(Math.pow(clientX - buttonCenterRef.current.x, 2) + Math.pow(clientY - buttonCenterRef.current.y, 2)) > 71) {
                setButtonState(null);
                buttonStateRef.current = null;
            } else if (buttonStateRef.current === null && Math.sqrt(Math.pow(clientX - buttonCenterRef.current.x, 2) + Math.pow(clientY - buttonCenterRef.current.y, 2)) <= 71) {
                setButtonState(pointerId);
                buttonStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }

            if (triangleStateRef.current === pointerId && Math.sqrt(Math.pow(clientX - triangleCenterRef.current.x, 2) + Math.pow(clientY - triangleCenterRef.current.y, 2)) > 71) {
                setTriangleState(null);
                triangleStateRef.current = null;
            } else if (triangleStateRef.current === null && Math.sqrt(Math.pow(clientX - triangleCenterRef.current.x, 2) + Math.pow(clientY - triangleCenterRef.current.y, 2)) <= 71) {
                setTriangleState(pointerId);
                triangleStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'medium'}));
            }
            if (homeStateRef.current === pointerId && Math.sqrt(Math.pow(clientX - homeCenterRef.current.x, 2) + Math.pow(clientY - homeCenterRef.current.y, 2)) > 23) {
                setHomeState(null);
                homeStateRef.current = null;
            } else if (homeStateRef.current === null && Math.sqrt(Math.pow(clientX - homeCenterRef.current.x, 2) + Math.pow(clientY - homeCenterRef.current.y, 2)) <= 23) {
                setHomeState(pointerId);
                homeStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
            }
            if (plusStateRef.current === pointerId && Math.sqrt(Math.pow(clientX - plusCenterRef.current.x, 2) + Math.pow(clientY - plusCenterRef.current.y, 2)) > 23) {
                setPlusState(null);
                plusStateRef.current = null;
            } else if (plusStateRef.current === null && Math.sqrt(Math.pow(clientX - plusCenterRef.current.x, 2) + Math.pow(clientY - plusCenterRef.current.y, 2)) <= 23) {
                setPlusState(pointerId);
                plusStateRef.current = pointerId;
                sendMessageToParent(JSON.stringify({name: 'haptic', type: 'light'}));
            }
        }
    }

    const onTouchEnd = (e) => {
        e.preventDefault();
        const {pointerId} = e;
        if (joystickStateRef.current.id === pointerId) {
            setJoystickState({x: 0, y: 0, id: null});
            joystickStateRef.current = {x: 0, y: 0, id: null};
        }
        if (circleStateRef.current === pointerId) {
            setCircleState(null);
            circleStateRef.current = null;
        }
        // new button
        if (buttonStateRef.current === pointerId) {
            setButtonState(null);
            buttonStateRef.current = null;
        }
        if (triangleStateRef.current === pointerId) {
            setTriangleState(null);
            triangleStateRef.current = null;
        }
        if (homeStateRef.current === pointerId) {
            sendMessageToParent(JSON.stringify({name: 'exit-confirmation'}));
            setHomeState(null);
            homeStateRef.current = null;
        }
        if (plusStateRef.current === pointerId) {
            setPlusState(null);
            plusStateRef.current = null;
        }
    }

    return (
        <Box
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                overflow: 'hidden',
                backgroundColor: '#E2E2E2',
                touchAction: 'none',
            }}
            onLoad={memoizedSetCenters}
            onPointerDown={memoizedTouchStart}
            onPointerMove={memoizedTouchMove}
            onPointerLeave={memoizedTouchEnd}
        >
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 63,
                    marginBottom: 58,
                    width: 274,
                    height: 274,
                    borderRadius: 274,
                    backgroundColor: '#C6C6C6',
                    boxShadow: '3px 0px 3px 0px #FFF inset, -3px 0px 3px 0px rgba(0, 0, 0, 0.35) inset',
                    position: 'relative',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 140,
                        height: 140,
                        borderRadius: 140,
                        backgroundColor: '#EBEBEB',
                        boxShadow: '-3px 0px 3px 0px #FFF inset, 3px 0px 3px 0px rgba(0, 0, 0, 0.35) inset',
                        filter: 'drop-shadow(0px 0px 25px rgba(0, 0, 0, 0.35))',
                        position: 'absolute',
                        top: joystickTopLeft.top,
                        left: joystickTopLeft.left,
                        transform: 'translateZ(0)',
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 110,
                            height: 110,
                            borderRadius: 110,
                            backgroundColor: '#BB3D3D',
                            boxShadow: '1px 0px 1px 0px #FFF inset, -1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                        }}
                    >
                        <Box
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: 104,
                                height: 104,
                                borderRadius: 104,
                                backgroundColor: '#EBEBEB',
                                boxShadow: '-1px 0px 1px 0px #FFF inset, 1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                            }}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: 84,
                                    height: 84,
                                    borderRadius: 84,
                                    backgroundColor: '#EBEBEB',
                                    boxShadow: '1px 0px 1px 0px #FFF inset, -1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                                }}
                            >
                                <Box
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 77,
                                        height: 77,
                                        borderRadius: 77,
                                        backgroundColor: '#EBEBEB',
                                        boxShadow: '-1px 0px 1px 0px #FFF inset, 1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%',
                }}
            >
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 26,
                    }}
                >
                    <img src={'./assets/logo.svg'} alt={'logo'} style={{width: 63, height: 32}} />
                </Box>
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 20,
                        marginBottom: 141,
                    }}
                >
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 44.181,
                            height: 44.181,
                            borderRadius: 44.181,
                            backgroundColor: homeState !== null ? '#DADADA' : '#EBEBEB',
                            boxShadow: homeState !== null ? '1px 0px 1px 0px #FFF inset, -1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset' : '-1px 0px 1px 0px #FFF inset, 1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                        }}
                    >
                        <img src={'./assets/home.svg'} alt={'home'} style={{width: 24, height: 22}} />
                    </Box>
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 44.181,
                            height: 44.181,
                            borderRadius: 44.181,
                            backgroundColor: plusState !== null ? '#DADADA' : '#EBEBEB',
                            boxShadow: plusState !== null ? '1px 0px 1px 0px #FFF inset, -1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset' : '-1px 0px 1px 0px #FFF inset, 1px 0px 1px 0px rgba(0, 0, 0, 0.35) inset',
                        }}
                    >
                        <img src={'./assets/plus.svg'} alt={'plus'} style={{width: 21, height: 21}} />
                    </Box>
                </Box>
            </Box>
            <Box
                // right side button holders
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 63,
                    marginBottom: 58,
                    width: 274,
                    height: 274,
                    position: 'relative',
                }}
            >
                <Box
                    // single button to fill the entire right side
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%', // fill the entire width
                        height: '100%', // fill the entire height
                        marginLeft: 'auto', // push to the right
                        marginRight: 33, // maintain margin on the right
                        marginBottom: 33,
                        padding: 10,
                    }}
                >
                    {/* Content for the single button */}
                    <button
                        style={{
                            backgroundColor: 'rgb(187, 61, 61)',
                            height: '100%',
                            width: '100%',
                            borderRadius: '100%',
                        }}
                    >
                        <h1>SHOOT!</h1>
                    </button>

                </Box>
            </Box>
        </Box>
    );
}

export default App;