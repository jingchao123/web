var sw = 20,sh = 20,td = 30,th = 30;
var btn = document.getElementById('btn');
var start = document.getElementsByClassName('start')[0];
var stop = document.getElementsByClassName('stop')[0];
var myscore = document.getElementsByClassName('myscore')[0];
var bordercolor = document.getElementsByClassName('content')[0];
var bodycolor = document.getElementsByTagName('body')[0];
var snake = null, //蛇的实例
    food = null,game=null;
var color=['#fce38a','#f38181','#eaffd0','#a6e3e9','#fcbad3','#f08a5d','#aa96da','#95e1d3','#f9f7f7','#3f72af']
function Square(x, y, classname){
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;
    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    // console.log(this.parent)
    this.parent = document.getElementsByClassName('snakeWrap')[0];
}
Square.prototype.create = function(){
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw+'px';
    this.viewContent.style.height = sh+'px';
    this.viewContent.style.left = this.x+'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent);
};
function Snake(){
    this.head=null;//存蛇头的信息
    this.tail=null;//存蛇尾
    this.pos=[];//存储蛇身上的方块位置;
    this.directionNum={
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
}
Snake.prototype.init=function(){
    var snakeHead = new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head =snakeHead;
    this.pos.push([2,0]);//存蛇头的位置
    var snakeBody1=new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pos.push([1,0]);//存蛇第一节身体的位置
    var snakeBody2=new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail=snakeBody2;
    this.pos.push([0,0]);
    snakeHead.last=null;
    snakeHead.next=snakeBody1;
    snakeBody1.last=snakeHead;
    snakeBody1.next=snakeBody2;
    snakeBody2.last=snakeBody1;
    snakeBody2.next=null;
    //添加默认方向
    this.direction=this.directionNum.right;
};
Snake.prototype.getNextPos=function(){
    var nextPos=[//蛇头的下一步坐标
        this.head.x/sw+this.direction.x,
        this.head.y/sw+this.direction.y
    ]
    // console.log(this.head.x/sw+this.direction.x);
    var selfCollied=false//默认没撞到自己
    //下个点是自己
    this.pos.forEach(function(value){
        if(value[0] == nextPos[0] && value[1] == nextPos[1]){
            selfCollied=true;
        }
    })
    if(selfCollied){
        //撞到自己了
        this.strategies.die.call(this);
        return
    }
    //下个点是墙
    if(nextPos[0]==td || nextPos[0]==-1 || nextPos[1]==-1 || nextPos[1]==th){
        //撞墙
        this.strategies.die.call(this);
        return
    }
    //下个点是食物
    if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){
        this.strategies.eat.call(this);
    }
    //下个点没有啥
    this.strategies.move.call(this,false);
    // this.strategies.move.call(this);
};
Snake.prototype.strategies={//处理碰撞后的事件
    move:function(format){//此参数用于决定是否删除最后一个方块
        var newBody = new Square(this.head.x/sw, this.head.y/sh,'snakeBody');
         newhead = new Square(this.head.x/sw+this.direction.x,this.head.y/sw+this.direction.y, 'snakeHead');
        newBody.next = this.head.next;
        newBody.last = newhead;
        this.head.remove();
        newhead.create();
        newBody.create();
        newBody.next.last = newBody;
        newhead.last = null;
        newhead.next = newBody;
        newhead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)'
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sw+this.direction.y])
        this.head=newhead;
        if(!format){//若format是false，表示需要删除
            this.tail = this.tail.last;
            this.tail.next.remove();
            this.tail.next=null;
            this.pos.pop();//删除位置数组中最后一个
        }
    },
    eat:function(){
        var t = 0;
        this.strategies.move.call(this,true);
        food = null;
        createFood();
        game.score++;
        myscore.innerText = '分数:'+game.score;
        if(game.score > 9) t = game.score%10;
        else t = game.score;
        bordercolor.style.border = '20px solid'+color[t];
        bodycolor.style.backgroundColor = color[(t+1)%10];

    },
    die:function(){
        game.over();
    }
}
snake = new Snake();
// snake.getNextPos();
function createFood(){
    var x = null,y = null;//食物的坐标
    var include=true;//true表示随机的坐标在蛇身上,fasle表示坐标不在蛇身上
    while(include){
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(th-1));
        snake.pos.forEach(function(value){
            if(value[0]!=x && value[1]!=y) include = false;
        })
    }
    food = new Square(x,y,'Food');
    food.pos=[x,y];
    var foodDom=document.querySelector('.Food');
    if(foodDom){
        foodDom.style.left=x*sw+'px';
        foodDom.style.top=y*sh+'px';
    }
    else{
        food.create();
    }
    
}

//创建游戏逻辑
function Game(){
    this.timer=null;
    this.score=0;
}
Game.prototype.init=function(){
    snake.init();
    createFood();
    document.onkeydown=function(e){
        if(e.which==37 && snake.direction!=snake.directionNum.right){//左键
            snake.direction=snake.directionNum.left;
        }
        else if(e.which==38 && snake.direction!=snake.directionNum.down){//上键
            snake.direction=snake.directionNum.up;
        }
        else if(e.which==39 && snake.direction!=snake.directionNum.left){//右键
            snake.direction=snake.directionNum.right;
        }
        else if(e.which==40 && snake.direction!=snake.directionNum.up){//下键
            snake.direction=snake.directionNum.down;
        }
        if(e.which==32 && model == 0){
            start.click();
        }
        else if(e.which==32 && model == 1){
            stop.click();
        }
    }
    this.start();
}
Game.prototype.start=function(){
    
    this.continue=function(){
        this.timer=setInterval(function(){
        snake.getNextPos();
    },200)
    }
    this.clear=function(){
        clearInterval(this.timer);
    } 
}
Game.prototype.over=function(){
    game.clear();
    alert('游戏结束，当前得分:'+this.score);
    var snakeWrap = document.getElementsByClassName('snakeWrap')[0];
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    game.init();
    stop.click();
}
game = new Game();
game.init();
start.onclick = function (){
    start.style.display = 'none';
    stop.style.display = 'block';
    game.continue();
    model = 1;
}

stop.onclick = function(){
    stop.style.display = 'none';
    start.style.display = 'block';
    game.clear();
    model = 0;
}
var model = 0;