/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import '../styling/Style.CSS';
import 'survey-react/survey.css';


export default class SideNavBar extends Component {
  constructor(props) {
    super(props);
    this.hashmap = [];
    this.countMap = [];
    this.state = {
      displayNavBars: [],
      displaysubNavBars: [],
      curSection: [],
      parsedJSON: null,
    };
    this.toggleSubNavBar = this.toggleSubNavBar.bind(this);
    this.renderEachNarBar = this.renderEachNarBar.bind(this);
    this.renderEachSubNarBar = this.renderEachSubNarBar.bind(this);
    this.renderPanel = this.renderPanel.bind(this);
    this.reFormatRawSurvey = this.reFormatRawSurvey.bind(this);
    this.navigatePanel = this.navigatePanel.bind(this);
    this.changeNavBarOnClick = this.changeNavBarOnClick.bind(this);
  }

  componentDidMount() {
    console.log('inside new bar');
    console.log('pages', this.props.pages);
    this.renderEachNarBar();
    this.reFormatRawSurvey();
    console.log('hash', this.hashmap);
    console.log('countmap', this.countMap);
  }

  renderEachNarBar() {
    this.setState({
      displayNavBars: [],
      displaysubNavBars: [],
    });
    this.countMap = [];
    this.props.pages.map(
      (section, index) => {
        this.countMap.push({
          section: section.name,
          num: 0,
          totalSubSection: section.elements.length,
        });

        const subSections = [];
        for (let i = 0; i < section.elements.length; i++) {
          subSections.push(<li> <button
                                            id = {section.elements[i].title}
                                            name = {section.elements[i].title}
                                            className = "SubNavBar"
                                            onClick = {this.navigatePanel}>
                                            {section.elements[i].title}
                                        </button>
                                    </li>);
        }
        this.setState(
          (prevState) => {
            prevState.displaysubNavBars.push(subSections);
            prevState.displayNavBars.push(<li><button
                                                            id= {section.name}
                                                            name = {section.name}
                                                            value = {index}
                                                            className = "NavBar"
                                                            onClick = {this.toggleSubNavBar}>
                                                            {section.name}
                                                        </button>
                                                    </li>);
            return ({
              displayNavBars: prevState.displayNavBars,
              displaysubNavBars: prevState.displaysubNavBars,
            });
          },
        );
      },
    );
  }

  reFormatRawSurvey() {
    // do everything formatting here after initializing
    let name = '';
    let elements = null;
    let title = '';
    const result = {
      pages: [],
    };
    let num = 0;
    // loop through the pages
    for (let i = 0; i < this.props.pages.length; i++) {
      name = this.props.pages[i].name;
      title = this.props.pages[i].title;
      elements = this.props.pages[i].elements;
      let panel = [];
      for (let j = 0; j < elements.length; j++) {
        // this is the new element
        panel = elements[j];
        const ele = {
          name,
          elements: [panel],
          title,
        };
        this.hashmap.push({
          ele,
          number: num,
        });
        num += 1;
        result.pages.push(ele);
      }
    }
    this.setState({
      parsedJSON: result,
    }, () => {
      let rawJSON = this.state.parsedJSON;
      console.log('parsedJSON', rawJSON);
      rawJSON = JSON.stringify(rawJSON);
      this.props.renderPanel(rawJSON);
    });
  }

  cleanCountMap() {
    for (let i = 0; i < this.countMap.length; i++) {
      this.countMap[i].num = 0;
    }
  }

  findCorrectSubSection(isNext) {
    const n = isNext ? this.props.curPageNo + 1 : this.props.curPageNo - 1;
    // upper and lower bounds are inclusive
    let lowerBound = 0;
    // could possibly incur error because there might not be any thing in countmap if there's no section
    let upperBound = this.countMap[0].totalSubSection - 1;
    for (let i = 0; i < this.countMap.length - 1; i++) {
      if (n >= lowerBound && n <= upperBound) {
        return [this.countMap[i].section, i];
      }
      lowerBound = upperBound + 1;
      upperBound += this.countMap[i + 1].totalSubSection;
    }
    const finalIndex = this.countMap.length - 1;
    return [this.countMap[finalIndex].section, finalIndex];
  }

  changeNavBarOnClick(isNext) {
    this.setState({
      curSection: [],
    });
    // reset the countmap's num to zero
    this.cleanCountMap();
    // clean the navbar structure
    this.renderEachNarBar();
    // find the name of the correct subsection
    const curSecName = this.findCorrectSubSection(isNext)[0];
    const startIndex = this.findCorrectSubSection(isNext)[1];
    this.countMap[startIndex].num++;
    // add the correct subbar
    let index = 0;
    const sectionOfInterest = this.props.pages.filter(
      (section, i) => {
        // don't change this to triple equals
        if (section.name == curSecName) index = i;
        return section.name == curSecName;
      },
    )[0];
    this.setState({
      curSection: sectionOfInterest,
    });
    const curSubSection = this.state.displaysubNavBars[startIndex];
    this.setState(
      (prevState) => {
        for (let k = curSubSection.length; k > 0; k--) {
          prevState.displayNavBars.splice(startIndex + 1, 0, curSubSection[k - 1]);
        }
        return ({
          displayNavBars: prevState.displayNavBars,
        });
      }, () => {
        // let n = isNext ? this.props.curPageNo+1 : this.props.curPageNo-1
        const curSubSecName = this.hashmap[this.props.curPageNo].ele.elements[0].title;
        if (document.getElementById(curSubSecName) !== null) {
          for (let k = 0; k < curSubSection.length; k++) {
            const tempID = this.props.pages[startIndex].elements[k].title;
            document.getElementById(tempID).setAttribute('class', 'SubNavBar');
          }
          document.getElementById(curSubSecName).setAttribute('class', 'highLighted');
        } else {
          console.log('nothing found');
        }
      },
    );
  }

  renderEachSubNarBar(event, sectionIndex, startIndex) {
    let index = 0;
    const sectionOfInterest = this.props.pages.filter(
      (section, i) => {
        // don't change this to triple equals
        if (section.name == event.target.name) index = i;
        return section.name == event.target.name;
      },
    )[0];
    this.setState({
      curSection: sectionOfInterest,
    });
    const curSubSection = this.state.displaysubNavBars[sectionIndex];
    this.setState(
      (prevState) => {
        for (let k = curSubSection.length; k > 0; k--) {
          prevState.displayNavBars.splice(startIndex, 0, curSubSection[k - 1]);
        }
        return ({
          displayNavBars: prevState.displayNavBars,
        });
      },
    );
  }


  toggleSubNavBar(event) {
    let index = 0;
    let startIndex = 0;
    for (let i = 0; i < this.countMap.length; i++) {
      startIndex += 1;
      if (event.target.name === this.countMap[i].section) {
        this.countMap[i].num++;
        index = this.countMap[i].num;
        break;
      }
      if (this.countMap[i].num % 2 === 1) {
        startIndex += this.countMap[i].totalSubSection;
      }
    }
    if (index % 2 === 1) {
      this.renderEachSubNarBar(event, event.target.value, startIndex);
    } else {
      const total = this.state.displaysubNavBars[event.target.value].length;
      this.state.displayNavBars.splice(startIndex, total);
      this.setState({
        displayNavBars: this.state.displayNavBars,
      });
    }
  }

  navigatePanel(event) {
    this.props.onsendPartial();
    for (let i = 0; i < this.hashmap.length; i++) {
      if (this.hashmap[i].ele.elements[0].title == event.target.name) {
        this.props.navigatePanel(this.hashmap[i].number);
      }
    }
  }

  renderPanel(event) {
    let json = this.state.curSection.elements;
    json = json.filter(
      (element, index) => element.title === event.target.name,
    )[0];
    json = JSON.stringify(json);
    this.props.renderPanel(json);
  }

  render() {
    return (
            <div>
                {this.state.displayNavBars}
            </div>
    );
  }
}
