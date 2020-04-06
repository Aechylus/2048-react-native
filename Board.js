import React, { Component } from 'react';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import { RemoveScroll } from 'react-remove-scroll';
import './Board.css';
import Direction from './Direction';

class Square extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            textSize: this.calcTextSize(this.props.value),
        }
    }

    render() {
        const value = this.props.value;
        const style = {
            background: this.calcBackgroundColor(value),
            fontSize: this.state.textSize,
            color: this.calcTextColor(value),
        }

        return (
            <div className="square" style={style}>
                {value !== 0 ? value : ""}
            </div >
        );
    }

    calcBackgroundColor(value) {
        const COLOR_EMPTY = 'rgb(238, 228, 218, 0.35)';
        const COLOR_2 = 'rgb(238, 228, 218)';
        const COLOR_4 = 'rgb(237, 224, 200)';
        const COLOR_8 = 'rgb(242, 177, 121)';
        const COLOR_16 = 'rgb(245, 149, 99)';
        const COLOR_32 = 'rgb(246, 124, 95)';
        const COLOR_64 = 'rgb(246, 94, 59)';
        const COLOR_128 = 'rgb(237, 207, 114)';
        const COLOR_256 = 'rgb(237, 204, 97)';
        const COLOR_512 = 'rgb(237, 200, 80)';
        const COLOR_1024 = 'rgb(237, 197, 63)';
        const COLOR_2048 = 'rgb(237, 194, 46)';
        const COLOR_OTHER = 'black';

        switch (value) {
            case 0:
                return COLOR_EMPTY;
            case 2:
                return COLOR_2;
            case 4:
                return COLOR_4;
            case 8:
                return COLOR_8;
            case 16:
                return COLOR_16;
            case 32:
                return COLOR_32;
            case 64:
                return COLOR_64;
            case 128:
                return COLOR_128;
            case 256:
                return COLOR_256;
            case 512:
                return COLOR_512;
            case 1024:
                return COLOR_1024;
            case 2048:
                return COLOR_2048;
            default:
                return COLOR_OTHER;
        }
    }

    calcTextColor(value) {
        const COLOR_VALUE_LIGHT = 'rgb(249, 246, 242)'; // For tiles >= 8
        const COLOR_VALUE_DARK = 'rgb(119, 110, 101)'; // For tiles < 8

        if (value >= 8) {
            return COLOR_VALUE_LIGHT;
        } else {
            return COLOR_VALUE_DARK;
        }
    }

    calcTextSize(value) {
        const TWO_DIGITS = 45;
        const THREE_DIGITS = 37;
        const FOUR_DIGITS = 30;
        const FIVE_DIGITS = 25;

        let toReturn = 0;
        if (value >= 0 && value < 10) {
            toReturn = TWO_DIGITS;
        } else if (value >= 10 && value < 100) {
            toReturn = TWO_DIGITS;
        } else if (value >= 100 && value < 1000) {
            toReturn = THREE_DIGITS;
        } else if (value >= 1000 && value < 10000) {
            toReturn = FOUR_DIGITS;
        } else {
            toReturn = FIVE_DIGITS;
        }

        if (window.innerWidth < 500) {
            toReturn *= window.innerWidth / 500;
        }
        return toReturn;
    }


    debounce(fn, ms) {
        let timer;
        return _ => {
            clearTimeout(timer)
            timer = setTimeout(_ => {
                timer = null
                fn.apply(this, arguments)
            }, ms)
        };
    }

    debouncedResizeText = this.debounce(function resizeText() {
        this.setState({
            textSize: this.calcTextSize(this.props.value),
        });
        console.log("Resizing into " + this.state.textSize);
    }, 250)

    componentDidMount() {
        window.addEventListener('resize', this.debouncedResizeText);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.debouncedResizeText);
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.keyPressHandler = this.keyPressHandler.bind(this);
        this.gameOverClickHandler = this.gameOverClickHandler.bind(this);
    }
    componentDidMount() {
        document.addEventListener("keydown", this.keyPressHandler, false);
    }


    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyPressHandler, false);
    }

    keyPressHandler(event) {
        let keyPressed = event.key;
        const upKeys = ["w", "W", "ArrowUp"];
        const downKeys = ["s", "S", "ArrowDown"];
        const leftKeys = ["a", "A", "ArrowLeft"];
        const rightKeys = ["d", "D", "ArrowRight"];

        for (let i = 0; i < upKeys.length; i++) {
            if (keyPressed === upKeys[i]) {
                this.props.onMovement(Direction.UP);
                return;
            }
        }

        for (let i = 0; i < downKeys.length; i++) {
            if (keyPressed === downKeys[i]) {
                this.props.onMovement(Direction.DOWN);
                return;
            }
        }

        for (let i = 0; i < leftKeys.length; i++) {
            if (keyPressed === leftKeys[i]) {
                this.props.onMovement(Direction.LEFT);
                return;
            }
        }

        for (let i = 0; i < rightKeys.length; i++) {
            if (keyPressed === rightKeys[i]) {
                this.props.onMovement(Direction.RIGHT);
                return;
            }
        }
    }

    gameOverClickHandler() {
        if (this.props.gameOver()) {
            this.props.resetBoard();
        }
    }

    onSwipe(gestureName, gestureState) {
        const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        switch (gestureName) {
            case SWIPE_UP:
                this.props.onMovement(Direction.UP);
                return;
            case SWIPE_DOWN:
                this.props.onMovement(Direction.DOWN);
                return;
            case SWIPE_LEFT:
                this.props.onMovement(Direction.LEFT);
                return;
            case SWIPE_RIGHT:
                this.props.onMovement(Direction.RIGHT);
                return;
        }
    }


    render() {
        let status = 'Score: ' + this.props.score;

        let gameOverStyle = {}
        if (this.props.gameOver()) {
            gameOverStyle = {
                opacity: 1,
                minHeight: window.innerHeight
            }
        }

        const fullHeightStyle = {
            minHeight: window.innerHeight
        }

        const grid = this.props.grid;

        return (
            <div className="root">
                <RemoveScroll></RemoveScroll>
                <GestureRecognizer onSwipe={(direction, state) => this.onSwipe(direction, state)}>
                    <div className="game-over" style={gameOverStyle}>
                        <div className="game-over-overlay" style={fullHeightStyle}></div>
                        <div className="game-over-content">
                            <div className="game-over-text">
                                Game Over
                            </div>
                            <div className="game-over-button">
                                <button onClick={this.gameOverClickHandler}>New Game</button>
                            </div>
                        </div>
                    </div>
                    <div className="game" style={fullHeightStyle}>
                        <div className="status">{status}</div>
                        <div className="board">
                            <Square value={grid[0][0]} />
                            <Square value={grid[0][1]} />
                            <Square value={grid[0][2]} />
                            <Square value={grid[0][3]} />
                            <Square value={grid[1][0]} />
                            <Square value={grid[1][1]} />
                            <Square value={grid[1][2]} />
                            <Square value={grid[1][3]} />
                            <Square value={grid[2][0]} />
                            <Square value={grid[2][1]} />
                            <Square value={grid[2][2]} />
                            <Square value={grid[2][3]} />
                            <Square value={grid[3][0]} />
                            <Square value={grid[3][1]} />
                            <Square value={grid[3][2]} />
                            <Square value={grid[3][3]} />
                        </div>
                    </ div>
                </GestureRecognizer>
            </div >
        );
    }
}

export default Board;