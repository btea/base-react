import React,{Component} from  'react'
import Button from '../Button/Button'
import PropTypes from 'prop-types'


export default class Body extends Component{
    static contextTypes = {
      store: PropTypes.object
    }
    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
        this._upState();
    }
    _upState(){
        const {store} = this.context;
        this.setState({
            ...store
        })
    }
    render(){
        return (
            <div>
                <div className="body">{this.state.body}</div>
                <Button />
            </div>
        )
    }
}