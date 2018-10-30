import React from 'react';


export default class User extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        fetch('/list').then(res => res.text()).then(data => {
            console.log(data);
        })
    }


    render(){
        return (
            <div>this is center</div>
        )
    }
}