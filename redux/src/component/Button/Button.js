import React,{Component} from 'react';
import PropTypes from 'prop-types';

export default class Button extends Component{
    static contextTypes = {
        store: PropTypes.object
    }
    constructor(props){
        super(props);
        this.state = {};
    }
    _upState(){
        const {store} = this.context;
        this.setState({
            ...store
        })
    }
    render(){
        return (
            <div className="button">
                <div className="btn">改变 head</div>
                <div className="btn">改变 body</div>
            </div>
        );
    }
}