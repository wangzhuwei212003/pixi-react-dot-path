import React, {Component, PropTypes} from 'react';

import * as PIXI from "pixi.js";

import logo from './logo.svg';
import './App.css';

class App extends Component {

  static propTypes = {};

  constructor(props) {
    super(props);
    // bind animate function
    this.animate = this.animate.bind(this);
    this.addDot = this.addDot.bind(this);

    this.state = {
      dotsCurGoal: [],
      direction: 0, // 打算用0，1，2，3，4分别标识静止，x加y加，x减y加，x减y减，x加y减的5种情况。
      dots: []
    };
  }

  componentDidMount() {
    this.renderer = PIXI.autoDetectRenderer(1366, 768);


    this.stage = new PIXI.Container();
    this.stage.width = 1000;
    this.stage.height = 500;
    console.log(this.stage);

    this.isWebGL = this.renderer instanceof PIXI.WebGLRenderer;

    if (!this.isWebGL) {
      this.renderer.context.mozImageSmoothingEnabled = false;
      this.renderer.context.webkitImageSmoothingEnabled = false
    }
    /*
     * Fix for iOS GPU issues
     */
    this.renderer.view.style['transform'] = 'translatez(0)';

    this.refs.gameCanvas.appendChild(this.renderer.view);

    // this.dotTexture = new PIXI.Texture.fromImage(logo,undefined,undefined, 1.0);
    // dot container
    // this.dotContainer = new PIXI.particles.ParticleContainer(1000, [false, true, false, false, false]);
    // this.stage.addChild(this.dotContainer);
    // for(let i=0; i<10; i++){
    //   this.addDot()
    // }


    // draw rect
    this.rect = new PIXI.Graphics();
    this.rect.lineStyle(4, 0xFF3300, 1);
    this.rect.beginFill(0x66CCFF);
    this.rect.drawRect(0, 0, 64, 64);
    this.rect.endFill();
    this.rect.x = 170;
    this.rect.y = 170;
    this.stage.addChild(this.rect);

    // // draw circle
    this.circle = new PIXI.Graphics();
    this.circle.beginFill(0x9966FF);
    this.circle.drawCircle(0, 0, 32);
    this.circle.endFill();
    this.circle.x = 64;
    this.circle.y = 64;
    this.stage.addChild(this.circle);

    // path
    const p1 = {
      x: -50,
      y: 0
    };
    const p2 = {
      x: 380,
      y: 0
    };
    const p3 = {
      x: 380,
      y: 150
    };
    const p4 = {
      x: 180,
      y: 150
    };
    const p5 = {
      x: 180,
      y: 350
    };
    const p6 = {
      x: 480,
      y: 350
    };
    this.path = [p1, p2, p3, p4, p5, p6];
    // draw line
    this.line = new PIXI.Graphics();
    this.line.lineStyle(4, 0xFFFFFF, 1);
    this.line.moveTo(this.path[0].x, this.path[0].y);
    // this.line.lineTo(80, 0);
    // this.line.lineTo(80, 150);
    // this.line.lineTo(180, 150);
    // this.line.lineTo(180, 350);
    // this.line.lineTo(480, 350);
    for (let i = 1; i < this.path.length; i++) {
      this.line.lineTo(this.path[i].x, this.path[i].y)
    }
    this.line.x = 64;
    this.line.y = 64;
    this.stage.addChild(this.line);

    // draw path

    console.log(this.path);

    this.initDots(30);

    this.animate(); // 循环更新
  }

  initDots(totalNum) {


    let startPoint = this.path[0];
    console.log('this.path from init dots');
    console.log(this.path);
    let nowX = startPoint.x;
    let nowY = startPoint.y;
    let nextPointIndex = 1;
    let nextPoint = this.path[nextPointIndex];
    this.addDot(nowX, nowY, nextPointIndex);

    let totalPath = 0; // 算出路径总长度
    this.path.forEach((ele, index, array)=>{
      if(index+1 !== array.length){
        if (ele.x === array[index+1].x){
          totalPath += Math.abs(array[index+1].y - ele.y);
        }else if(ele.y === array[index+1].y){
          totalPath += Math.abs(array[index+1].x - ele.x);
        }else{
          console.log('path 里面的点不是规则的点？')
        }
      }
    });
    console.log(totalPath);
    // let totalDots = ~~(totalPath/gap); // 根据gap算出所有点的个数
    // console.log(totalDots);

    let gap = totalPath/totalNum; // 根据gap算出所有点的个数
    console.log(gap);

    for (let i = 1; i < totalNum; i += 1) {
      // 算出每一个 dot 的x y，对应的下一个目标拐点，然后用 add cart。
      // 第一个点是起点。

      if (nowX === nextPoint.x) {
        //console.log(`判断为在${nowX}和${nextPoint.x}之间，y方向变化`); // 这个判断是错误的，这个x相同应该是y方向在变化
        //console.log(`第${i}个点`);
        if (nextPoint.y - nowY  > 0 && nextPoint.y - nowY > gap) {
          nowY += gap;
          this.addDot(nowX, nowY, nextPointIndex);
        } else if (nextPoint.y - nowY < 0 && nowY - nextPoint.y > gap) {
          nowY -= gap;
          this.addDot(nowX, nowY, nextPointIndex);
        } else {
          // 如果gap不够这一段，那么下一段肯定是x方向变化
          let newIndex = nextPointIndex + 1;
          const gapRemain = gap - Math.abs(nowY - nextPoint.y);

          // console.log(newIndex);
          // console.log(this.path[newIndex].x);
          // console.log(nextPoint.x);
          // console.log(gapRemain);

          if(newIndex === this.path.length){
            // 如果超了，整个的 init 都可以 return 了。
            return;
          }else{
            if (this.path[newIndex].x - nextPoint.x > 0 && this.path[newIndex].x - nextPoint.x > gapRemain) {
              nowY = nextPoint.y;
              nowX += gapRemain;
              this.addDot(nowX, nowY, newIndex);

              // console.log(newIndex);
              // console.log(nowX);
              // console.log(nowY);

              nextPoint = this.path[newIndex];
              nextPointIndex = newIndex;
            } else if (this.path[newIndex].x - nextPoint.x < 0 && nextPoint.x - this.path[newIndex].x  > gapRemain) {
              nowY = nextPoint.y;
              nowX -= gapRemain;
              this.addDot(nowX, nowY, newIndex);

              // console.log(newIndex);
              // console.log(nowX);
              // console.log(nowY);

              nextPoint = this.path[newIndex];
              nextPointIndex = newIndex;
            }else{
              // console.log('gap 太大 或者是 拐点太密');
              // console.log('todo，gap横跨2个及2个以上的拐点');
              nowY = nextPoint.y;
              nowX = nextPoint.x;
            }
          }
        }
      } else if (nowY === nextPoint.y) {
        // console.log(`判断为在${nowY}和${nextPoint.y}点之间，x方向变化`);
        // console.log(`第${i}个点`);
        if (nextPoint.x - nowX  > 0 && nextPoint.x - nowX > gap) {
          nowX += gap;
          this.addDot(nowX, nowY, nextPointIndex);
        } else if (nextPoint.x - nowX < 0 && nowX - nextPoint.x > gap) {
          nowX -= gap;
          this.addDot(nowX, nowY, nextPointIndex);
        } else {
          // 如果gap不够这一段，那么下一段肯定是y方向变化
          let newIndex = nextPointIndex + 1;
          const gapRemain = gap - Math.abs(nowX - nextPoint.x);

          // console.log(newIndex);
          // console.log(gapRemain);

          if(newIndex === this.path.length){
            // 如果超了，整个的 init 都可以 return 了。
            return;
          }else{
            if (this.path[newIndex].y - nextPoint.y > 0 && this.path[newIndex].y - nextPoint.y > gapRemain) {
              nowX = nextPoint.x;
              nowY += gapRemain;
              this.addDot(nowX, nowY, newIndex);
              nextPoint = this.path[newIndex];
              nextPointIndex = newIndex;
              // console.log(nowX);
              // console.log(nowY);

            } else if (this.path[newIndex].y - nextPoint.y < 0 && this.path[newIndex].y - nextPoint.y > gapRemain) {
              nowX = nextPoint.x;
              nowY -= gapRemain;
              this.addDot(nowX, nowY, newIndex);
              nextPoint = this.path[newIndex];
              nextPointIndex = newIndex;
            }else{
              // console.log('gap 太大 或者是 拐点太密');
              // console.log('todo，gap横跨2个及2个以上的拐点');
              nowY = nextPoint.y;
              nowX = nextPoint.x;
            }
          }
        }
      }
    }

  }

  addDot(x, y, goalIndex) {
    // let dot = new PIXI.Sprite(this.dotTexture);
    // console.log('dot',dot);
    // 先不想 svg 这种复杂的

    let circle = new PIXI.Graphics();
    circle.beginFill(0x559922);
    circle.drawCircle(0, 0, 5);
    circle.endFill();
    circle.x = this.line.x + x;
    circle.y = this.line.y + y; // 首先就从line的起点开始。偏移量加上计算出来的距离

    let preDotCurGoal = this.state.dotsCurGoal;
    let preDot = this.state.dots;
    preDotCurGoal.push({
      i: goalIndex,
      x: this.path[goalIndex].x,
      y: this.path[goalIndex].y,
    });
    preDot.push(circle);
    this.setState({
      dotsCurGoal:preDotCurGoal,
      dots: preDot
    }); // 在state里面保存每一个点的当前目标。

    // console.log(this.state.dotsCurGoal);
    // console.log(this.state.dots);
    this.stage.addChild(circle); // 所谓的 addDot， 关键就是在这一步，添加dot到container里面去。
  }

  updateDotState(index, circle){
    let preDots =  this.state.dots;
    preDots[index] = circle;
    this.setState({
      dots: preDots,
    })
  }

  updateDotGoalState(index, curGoal){
    let preDotsCurGoal = this.state.dotsCurGoal;
    preDotsCurGoal[index] = curGoal;
    this.setState({
      dotsCurGoal: preDotsCurGoal,
    })

    //console.log(this.state.dotsCurGoal[5])
  }

  animate() {
    // render the stage container
    // this.rect.x += 1;
    // if (this.rect.x === 200) {
    //   this.rect.x = 0
    // }

    //console.log(this.state.dots);

    if (this.state.dots.length !== 0) {
      for(let i=0;i<this.state.dots.length; i+=1){
        this.updateSingleDot(i); // 改变每一个点的位置，并setState。好像如果不 setState 不会有变化
      }
    }

    this.renderer.render(this.stage);
    this.frame = requestAnimationFrame(this.animate); // loop this function 60 per second
  }

  // 根据 index 更新一个点的位置, dots, dotsCurGoal. 这个函数可以说是用来分配下一个 goal 的。
  // 但是多个点需要首先初始状态设置好，然后再来用这个函数来foreach整个dots。
  updateSingleDot(index){
    let curCircle = this.state.dots[index];
    let curX = curCircle.x - this.line.x;
    let curY = curCircle.y - this.line.y; // 减去偏移量 才有可比较性
    // console.log(curX);
    // console.log(curY);
    const goalX = this.state.dotsCurGoal[index].x;
    const goalY = this.state.dotsCurGoal[index].y;

    if(index ===1){
      console.log(this.state.dotsCurGoal[index]);
    }
    //console.log(this.state.dotsCurGoal[index]);
    // 这里首先确定一个线速度
    const v = 1;

    if (curX === goalX) {
      //console.log(`判断为在${curY}和${goalY}之间，y方向变化`); // 这个判断是错误的，这个x相同应该是y方向在变化
      if (goalY - curY > 0 && goalY - curY > v) {
        curCircle.y += v;
        this.updateDotState(index, curCircle);
      } else if (goalY - curY < 0 && curY - goalY > v) {
        curCircle.y -= v;
        this.updateDotState(index, curCircle);
      } else {
        let laterIndex = this.state.dotsCurGoal[index].i + 1;
        if(laterIndex === this.path.length){
          curCircle.y = this.path[0].y + this.line.y;
          curCircle.x = this.path[0].x + this.line.x;
          this.updateDotState(index, curCircle);
          this.updateDotGoalState(index, {
              i:1,
              x:this.path[1].x,
              y:this.path[1].y,
          });
        }else{
          curCircle.y = goalY + this.line.y;
          this.updateDotState(index, curCircle);
          this.updateDotGoalState(index, {
              i:laterIndex,
              x:this.path[laterIndex].x,
              y:this.path[laterIndex].y,
          });
        }
      }
    } else if (curY === goalY) {
      //console.log(`判断${index}点变化`);
      //console.log(`判断为在${curX}和${goalX}点之间，x方向变化`);
      if (goalX - curX > 0 && goalX - curX > v) {
        curCircle.x += v;
        this.updateDotState(index, curCircle);
      } else if (goalX - curX < 0 && curX - goalX > v) {
        curCircle.x -= v;
        this.updateDotState(index, curCircle);
      } else {
        let laterIndex = this.state.dotsCurGoal[index].i + 1;
        if(laterIndex === this.path.length){
          curCircle.x = this.path[0].x + this.line.x;
          curCircle.y = this.path[0].y + this.line.y;
          this.updateDotState(index, curCircle);
          this.updateDotGoalState(index, {
              i:1,
              x:this.path[1].x,
              y:this.path[1].y,
          });
        }else{
          curCircle.x = goalX + this.line.x;
          this.updateDotState(index, curCircle);
          this.updateDotGoalState(index, {
              i:laterIndex,
              x:this.path[laterIndex].x,
              y:this.path[laterIndex].y,
          });
        }
      }
    }
  }

  render() {
    return (
        <div className="App" ref="gameCanvas">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <h2>Welcome to React</h2>
          </div>
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
        </div>
    );
  }
}

export default App;
