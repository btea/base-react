import React from 'react';
import ReactDom from 'react-dom';

import {BrowserRouter, Route, HashRouter, Link} from 'react-router-dom';
// import {browserHistory, Router, Route, IndexRoute} from 'react-router';

import User from './components/User';
import Center from './components/User';


class M extends React.Component{
    constructor(prop){
        super(prop)

        
        console.log(this);
    }
    render(){
        return (
            <div>
                <Link to="/user">
                    跳转至用户界面
                </Link>
                <div>1231634564</div>
            </div>
            
        )
    }
}

class Test extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            message: 'HI'
        }
    }

    
    handleClick(e){
        console.log(e.target);
        console.log(this);
    }

    // handleClick = (e) => {
    //     console.log(e.target);
    //     console.log(this);
    // }


    render(){
        return (
            <Link to="/center" href="center">
                <button onClick = { this.handleClick }>按钮</button>
            </Link>
            
        )
    }
}


const App = () => {
    return (
        <div>
            <M />
            <p>React here!</p>
            <Test />
        </div>
    );
}

// 使用HashRouter会出现#
// ReactDom.render(
//     <HashRouter>
//         <div>
//             <Route exact path="/" component={App}></Route>
//             <Route path="/User" component={User}/>
//             <Route path="/Center" component={Center} />
//         </div>
        
//     </HashRouter>
//     ,document.getElementById("app"));


ReactDom.render(
    <BrowserRouter>
        <div>
            {/* 如果默认路由没有添加exact属性，lotion虽然也会发生变化，但默认路由界面的内容会一直显示 */}
            <Route exact path="/" component={App} />
            <Route path="/User" component={User}/>
            <Route path="/Center" component={Center} />
        </div>
    </BrowserRouter>,
    document.getElementById("app")   
)
