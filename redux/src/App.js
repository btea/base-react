import React, { Component } from 'react';
import Head from './component/Head/Head';
import Body from './component/Body/Body';
import PropTypes from 'prop-types';


export default class App extends Component{
    static childContextTypes = {
        store: PropTypes.object
    };
    getChildContext(){
        const state = {
            head: '我是全局 head',
            body: '我是全局 body',
            headBtn: '修改 head',
            bodyBtn: '修改 body'
        };
        return {store: state}
    }

    render(){
        return (
            <div className="App">
                <Head />
                <Body />
            </div>
        );
    }
}
