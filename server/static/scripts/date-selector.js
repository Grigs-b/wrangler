
var React = require('react');
var DatePicker = require('react-datepicker');

console.log('file loaded');
var DateSelectorComponent = React.createClass({
    //general lifecycle methods
    componentWillMount: function(){

    },

    componentDidMount: function(){
        console.log('did mount date-selector');
        this.setState({
            startDate: moment()
        });
    },

    handleChange: function(date) {
        // post event that date changed
        $(document).trigger('dateChanged', [date]);
    },

    render: function() {
        return <DatePicker selected={this.state.startDate} onChange={this.handleChange} maxDate={this.state.startDate} />
    }
});

React.render(<DateSelectorComponent/>, document.getElementById('date-selector'));