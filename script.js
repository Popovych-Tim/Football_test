const ballsData = [
    {
        label: 'DIV',
        positionX: 325,
        positionY: 50,
        color: 'red',
    },
    {
        label: 'SPAN',
        positionX: 425,
        positionY: 50,
        color: 'green',
    },
    {
        label: 'NAV',
        positionX: 525,
        positionY: 50,
        color: 'blue',
    },
    {
        label: 'LI',
        positionX: 625,
        positionY: 50,
        color: 'cyan',
    },
    {
        label: 'P',
        positionX: 725,
        positionY: 50,
        color: 'magenta',
    },
    {
        label: 'IMG',
        positionX: 825,
        positionY: 50,
        color: 'yellow',
    }
];

const gameApp = {

    goalsTeamA: 0,
    goalsTeamB: 0,
    fieldAreaElement: null,
    scoresAElement: null,
    scoresBElement: null,
    gateAElement: null,
    gateBElement: null,
    lastBallPositionData: null,


    /**
     * @function. function with cycle inside which creates ball elements
     */
    mountBallsElements(ballsData) {
        ballsData.forEach((ballDataItem, i) => {
            let ballElement = document.createElement('div');
            ballElement.classList.add('game-balls__item');
            ballElement.innerHTML = ballDataItem.label;
            ballElement.style.left = `${ballDataItem.positionX}px`;
            ballElement.style.top = `${ballDataItem.positionY}px`;
            ballElement.style.background = ballDataItem.color;
            this.fieldAreaElement.appendChild(ballElement);
            this.attachMouseEvent(ballElement, this.checkBallElementCoords);
        });
    },

    /**
     * @function. that cheking the goal condition
     */
    isPointInArea(pointRect, areaRect) {
        const axis = ['x', 'y'];
        let inArea = true;
        axis.forEach((XorY) => {
            const leftOrTop = XorY === 'x' ? 'left' : 'top',
                  widthOrHeight = XorY === 'x' ? 'width' : 'height',
                  pointA = pointRect[leftOrTop],
                  pointB = pointRect[leftOrTop] + pointRect[widthOrHeight];
            inArea = inArea && (pointA >= areaRect[leftOrTop]) && (pointA <= areaRect[leftOrTop] + areaRect[widthOrHeight]) && 
                     (pointB >= areaRect[leftOrTop]) && (pointB <= areaRect[leftOrTop] + areaRect[widthOrHeight]);

            // here I have alternative condition of goal (I think its prettier). 
            // Instead of checking if full ball element
            // crossed the gate line, we check if the middle point
            // (the crossing point of X and Y axis) of the ball element crossed it.
 
            // const point = pointRect[leftOrTop] + pointRect[widthOrHeight]/2;
            // inArea = inArea && (point >= areaRect[leftOrTop]) && 
            // (point <= areaRect[leftOrTop] + areaRect[widthOrHeight]);

        });
        
        return inArea;
    },

    /**
     * @function checking the ball element coordinates after moving it
     */
    checkBallElementCoords(element) {
        const ballRect = element.getBoundingClientRect(),
              aGateRect = this.gateAElement.getBoundingClientRect(),
              bGateRect = this.gateBElement.getBoundingClientRect(),
              fieldRect = this.fieldAreaElement.getBoundingClientRect(),
              goalInGateA = this.isPointInArea(ballRect, aGateRect),
              goalInGateB = this.isPointInArea(ballRect, bGateRect);
        let destination = null;

        /**
         * @function. cloning the ball element, removing eventListener and 
         *            appending this element to the header container 
         *            or return it's 'click' coordinates if the ball is outside of the field
         */
        const cloneBalls = (ball, destination) => {
            
            if (goalInGateA ? destination = document.querySelector('.game-goals__list__A') :
                              destination = document.querySelector('.game-goals__list__B'));

                let goalScore = ball.cloneNode(true);
                goalScore.classList.add('game-balls__score');
                goalScore.classList.remove('game-balls__item');
                destination.append(goalScore);
            
        };

        if (goalInGateA) {
            this.goalsTeamA++;
            element.onmousedown = null;
            cloneBalls(element, destination);
            this.updateScores(this.goalsTeamA, this.goalsTeamB);
            
        } else if (goalInGateB) {
            this.goalsTeamB++;
            element.onmousedown = null;
            cloneBalls(element, destination);
            this.updateScores(this.goalsTeamA, this.goalsTeamB);
        }

        if ( !this.isPointInArea(ballRect, fieldRect) ) {
            const [event, shiftX, shiftY] = this.lastBollPositionData;
            this.fieldAreaElement.append(element);
            this.moveAt(element, this.calcBallPosition(event, fieldRect, shiftX , shiftY));
        }
    },
    
    /**
     * @function. taking the coordinates of 'click'
     */
    getElementShifts(event, element) {
        return [
            event.clientX - element.getBoundingClientRect().left,
            event.clientY - element.getBoundingClientRect().top
        ];
    },

    /**
     * @function. 'click' event on the ball and moving event
     */
    attachMouseEvent(element, mouseUpCallback) {
        element.onmousedown = (event) => {
            const [shiftX, shiftY] = this.getElementShifts(event, element);
            const fieldRect = this.fieldAreaElement.getBoundingClientRect();
            const onMouseMove = (event) => this.moveAt(element, this.calcBallPosition(event, fieldRect, shiftX , shiftY));
            this.lastBollPositionData = [event, shiftX, shiftY];
            this.fieldAreaElement.append(element);
            this.moveAt(element, this.calcBallPosition(event, fieldRect, shiftX , shiftY));
            document.addEventListener('mousemove', onMouseMove );

            element.onmouseup = (event) => {
                (typeof mouseUpCallback === 'function') && mouseUpCallback.call(this, element);
                document.removeEventListener('mousemove', onMouseMove );
                element.onmouseup = null;
            };
        };

    /**
     * @function. helps us to avoid conflicts with default Drag'n'Drop browser functions
     */
        element.ondragstart = function() {
            return false;
        };
    },

    calcBallPosition(event, fieldRect, shiftX, shiftY) {
        return {
            x: event.pageX - fieldRect.left - shiftX,
            y: event.pageY - fieldRect.top - shiftY
        };
    },

    /**
     * @function. moving the ball element to the coords. of 'click'
     */
    moveAt(element, cords) {
        element.style.left = cords.x + 'px';
        element.style.top = cords.y + 'px';
    },

    /**
     * @function. setting the score of match
     */ 
    updateScores(a, b) {
        this.scoresAElement.innerHTML = a;
        this.scoresBElement.innerHTML = b;
    },

    /**
     * @function. taking key-params from DOM tree and running the functions of balls and score creating 
     */
    init: function(options) {
        this.fieldAreaElement = document.getElementById('js-field-area');
        this.scoresAElement = document.getElementById('js-game-scores-a');
        this.scoresBElement = document.getElementById('js-game-scores-b');
        this.gateAElement = document.getElementById('js-game-gate-a');
        this.gateBElement = document.getElementById('js-game-gate-b');
        this.mountBallsElements(options.ballsData);
        this.updateScores(0,0);
    },
};

    /**
     * @function. initializing our app
     */
gameApp.init({
    ballsData,
});

