var React = require('react');
var Griddle = require('griddle-react');

var testData = [{"project": "Unknown", "status": "Reply with your status update.", "date": "2015-09-01", "id": 556, "developer": "dev null"}, {"project": "Unknown", "status": "SalixWorking on tabs and then moving on to detail cell updates", "date": "2015-09-01", "id": 557, "developer": "zach costa"}, {"project": "Regal", "status": " tracking down a bug in iOS9 version with text truncation wherelayoutManager:didCompleteLayoutForTextContainer:atEnd: get called atdifferent times that with iOS8. Did some task grooming for a new sprint.Working on some fixes to analytics and implementing a new convention fromJeremy. Still no API, their PM is seeing what they can do.", "date": "2015-09-01", "id": 569, "developer": "matt baranowski"}, {"project": "Unknown", "status": "CardnoTECQuick handoff from MattBAttended internal kickoffCreating external kickoff slide deckSkillsosoftResearched NTLM iOS and Android", "date": "2015-09-01", "id": 559, "developer": "mike runnals"}, {"project": "Unknown", "status": "Signal360 Talked to Carbonhouse to update the feature list and wating for Charles to merge the SDKs with VenueKit", "date": "2015-09-01", "id": 560, "developer": "serdar aslan"}, {"project": "Hatch Baby", "status": "Fixing a bug in the feeding metric/imperial conversions, then onto designreview tickets.", "date": "2015-09-01", "id": 561, "developer": "ben frye"}, {"project": "Unknown", "status": "burstimage uploading.uploading.uploading.NOT DONE", "date": "2015-09-01", "id": 562, "developer": "raven smith"}, {"project": "Unknown", "status": "NCAA10th inning. 5th quarter. 3rd half.Hoping to release today. Crunching through bugs found by QA. Fixing a bad memory leak.Halen WootenSoftware Engineer(o) 888.329.9875 x143halen.wooten@willowtreeapps.com <mailto:halen.wooten@willowtreeapps.com>WillowTree, Inc.", "date": "2015-09-01", "id": 563, "developer": "halen wooten"}, {"project": "Salix", "status": "Syncing on metadata and style guide today!", "date": "2015-09-01", "id": 564, "developer": "ian terrell"}, {"project": "Unknown", "status": "In the triangle underground office and missing the home team like crazy. The move was exhausting but it all went well.Thrillcall: catching up on progress, generation new signing bitsPopCast!: catching up on streaming email thread, working on getting sample streaming app functional with test server", "date": "2015-09-01", "id": 565, "developer": "joel garrett"}, {"project": "Unknown", "status": "SalixRefactoring the wrapper layer, trying out the VisualOn ad sdk and Google IMA SDK", "date": "2015-09-01", "id": 568, "developer": "tatyana casino"}, {"project": "Unknown", "status": "UVA HealthHope to actually start working on caching today. Perhaps going with a MVVM style modelWillowTreeReachabilityWorking to finalize the feedback from Ian and Yohe. Maybe make a cocoapod today :)Erik LaMannaPrincipal Software Engineer888.329.9875 x122  On September 1, 2015 at 9:36:13 AM, Ryan Grigsby (ryan.grigsby@willowtreeapps.com) wrote:WranglerFighting with Django's JSON Serialization and trying to get React+Griddle to behave", "date": "2015-09-01", "id": 570, "developer": "erik lamanna"}, {"project": "Unknown", "status": "Pepsi- Actually finishing document download today after a > 1.5 conversation", "date": "2015-09-01", "id": 571, "developer": "andrew carter"}, {"project": "Unknown", "status": "FOX", "date": "2015-09-01", "id": 572, "developer": "pete springett"}];

var statusModule = function () {
  var rootURL = 'http://localhost:8000/';

  function request(url, cb) {
    function listener(e) {
      if(oReq.readyState != 4 && e.type !== 'load') return;
      if(oReq.status && oReq.status != 200) {
        //this will be the error handler
      } else {
        cb(JSON.parse(oReq.responseText));
      }
    }

    var oReq;
    // Use XDomainRequest if it's available (to support IE<10)
    if (window.XDomainRequest) {
      oReq = new XDomainRequest();
      oReq.open('get', url, true);

      // Update the timeout to 30 seconds for XDomainRequests. 
      oReq.timeout = 30000;
    } else {
      oReq = new XMLHttpRequest();
      oReq.open('get', url, true);
      oReq.setRequestHeader('Accept', 'application/json');
    }
    oReq.onload = listener;

    // Wrap in a 0 millisecond timeout.
    // XDomainRequests appear to randomly fail unless kicked into a new scope.
    setTimeout(function(){
      oReq.send();
    }, 0);
  }

  function getResources(cb) {
    request(rootURL, cb);
  }

  //generic for ALL calls, todo, why optimize now!
  function getResource(u, cb) {

  }

  function singularRequestGenerator(path) {
    return function(id, cb) {
      request(rootURL + path + '/'+id+'/', cb);
    };
  }

  function pluralRequestGenerator(path) {
    return function() {
      console.log('request generated', path);
      if(arguments.length === 1) {
        request(rootURL + path + '/', arguments[0]);
      } else {
        request(rootURL + path + '/?page=' + arguments[0], arguments[1]);
      }
    };
  }

  function dateRequestGenerator(path) {
    return function(year, month, day, cb) {
        request(rootURL + path + '/'+year+'/'+month+'/'+day+'/');
    }
  }

  return {
    getResources:   getResources,
    getStatus:      dateRequestGenerator('status'),
    getStatuses:    pluralRequestGenerator('status'),
    getDeveloper:   singularRequestGenerator('people'),
    getDevelopers:  pluralRequestGenerator('people'),
    getProject:     singularRequestGenerator('projects')
  };

}();

var columnMetadata = [
  {
    "columnName": "date",
    "cssClassName": "col-md-2 col-xs-2"
  },
  {
    "columnName": "developer",
    "cssClassName": "col-md-2 col-xs-3"
  },
  {
    "columnName": "project",
    "cssClassName": "col-md-2 col-xs-3"
  },
  {
    "columnName": "status",
    "cssClassName": "col-md-6 col-xs-4"
  }
];

var ExternalStatusAPIComponent = React.createClass({
    getInitialState: function(){
      var initial = { "results": [],
          "currentPage": 0,
          "maxPages": 0,
          "externalResultsPerPage": 25,
          "externalSortColumn":null,
          "externalSortAscending":true
      };

      return initial;
    },
    getStatusData: function(page) {
        var that = this;
        var paged = page||1;

        statusModule.getStatuses(paged, function(data) {
          that.setState({
              serverData: data,
              results: data
          });
        });
    },

    //general lifecycle methods
    componentWillMount: function(){

    },

    componentDidMount: function(){
      this.getStatusData();
      $(document).on("dateChanged", this.dateChanged);
    },

    dateChanged: function(event, date) {
      console.log('DATE Changed', date, date.year(), date.month(), date.day());
      statusModule.getStatus(date.year(), date.month(), date.day())
    },

    setPage: function(index){
      //This should interact with the data source to get the page at the given index
      var number = index === 0 ? 0 : index * this.state.externalResultsPerPage;
      this.setState(
        {
          "results": this.state.serverData.slice(number, number+5>this.state.serverData.length ? this.state.serverData.length : number+this.state.externalResultsPerPage),
          "currentPage": index
        });
    },
    sortData: function(sort, sortAscending, data){
      //sorting should generally happen wherever the data is coming from 
      sortedData = _.sortBy(data, function(item){
        return item[sort];
      });

      if(sortAscending === false){
        sortedData.reverse();
      }
      return {
        "currentPage": 0,
        "externalSortColumn": sort,
        "externalSortAscending": sortAscending,
        "results": sortedData.slice(0,this.state.externalResultsPerPage)
      };
    },
    changeSort: function(sort, sortAscending){
      //this should change the sort for the given column
      this.setState(this.sortData(sort, sortAscending, this.state.results));
    },
    setFilter: function(filter){
        //filtering should generally occur on the server (or wherever) 
        //this is a lot of code for what should normally just be a method that is used to pass data back and forth
        var sortedData = this.sortData(this.state.externalSortColumn, this.state.externalSortAscending, this.state.serverData);

        if(filter === ""){
            this.setState(_.extend(sortedData, {maxPages: Math.round(sortedData.results.length > this.state.externalResultsPerPage ? sortedData.results.length/this.state.externalResultsPerPage : 1)}));

            return;
        }

        var filteredData = _.filter(sortedData.results,
            function(item) {
                var arr = _.values(item);
                for(var i = 0; i < arr.length; i++){
                   if ((arr[i]||"").toString().toLowerCase().indexOf(filter.toLowerCase()) >= 0){
                    return true;
                   }
                }

                return false;
            });

        this.setState({
            //serverData: filteredData,
            maxPages: Math.round(filteredData.length > this.state.externalResultsPerPage ? filteredData.length/this.state.externalResultsPerPage : 1),
            "results": filteredData.slice(0,this.state.externalResultsPerPage)
        });
    },
    setPageSize: function(size){
        this.setState({
            currentPage: 0,
            externalResultsPerPage: size,
            maxPages: Math.round(this.state.results.length > size ? this.state.results.length/size : 1),
            results: this.state.serverData.slice(0,size)
        });
    },
    render: function(){
      return <Griddle useExternal={true} columnMetadata={columnMetadata}  columns={["date", "developer", "project", "status"]}  
        externalChangeSort={this.changeSort} externalSetFilter={this.setFilter} externalSetPage={this.setPage}
        externalSetPageSize={this.setPageSize} externalMaxPage={this.state.maxPages}
        externalCurrentPage={this.state.currentPage} results={this.state.results} tableClassName="table" resultsPerPage={this.state.externalResultsPerPage}
        externalSortColumn={this.state.externalSortColumn} externalSortAscending={this.state.externalSortAscending} showFilter={true} showSettings={true} />
    }
});



React.render(<ExternalStatusAPIComponent/>, document.getElementById('content'));

var DatePicker = require('react-datepicker');
var moment = require('moment');

console.log('file loaded');
var DateSelectorComponent = React.createClass({
      getInitialState: function(){
      var initial = { 
          "startDate": moment()
      };

      return initial;
    },
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

