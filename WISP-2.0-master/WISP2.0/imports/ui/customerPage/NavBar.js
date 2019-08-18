/* eslint-disable no-empty */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-const */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable max-len */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import '../styling/Style.CSS';
import 'survey-react/survey.css';

export default class NavBar extends Component {
  constructor(props) {
    super(props);
    // contains all information about pages as displayed sections
    this.hashmap = [];
    // contains information about the sections and the number of subsections each has
    this.countMap = [];
    // an object having subsections as keys and boolean as values, indicating whether that subsection is finished
    this.completedForm = {};
    // an object having sections as keys and boolean as values, indicating whether that section is finished
    this.completedMap = {};

    this.renderSection = this.renderSection.bind(this);
    this.renderSubSection = this.renderSubSection.bind(this);
    this.navigatePanel = this.navigatePanel.bind(this);
    this.initCountMap = this.initCountMap.bind(this);
    this.renderPanel = this.renderPanel.bind(this);
    this.reFormatRawSurvey = this.reFormatRawSurvey.bind(this);
    this.changeNavBarOnClick = this.changeNavBarOnClick.bind(this);
    this.cleanCountMap = this.cleanCountMap.bind(this);
    this.toggleNavBar = this.toggleNavBar.bind(this);
    this.checkOnComplete = this.checkOnComplete.bind(this);
    this.state = {
      showNavBar: false,
    };
  }

  componentDidMount() {
    console.log('pages', this.props.pages);
    this.initCountMap();
    this.reFormatRawSurvey();
    console.log('hash', this.hashmap);
    console.log('countmap', this.countMap);
  }

  /**
   * reformat the raw survey json into sections that can be rendered by sections as pages
   */
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

      if (elements === undefined) { break; }
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
    console.log('parsed json', result.pages);
    this.setState({
      parsedJSON: result,
    }, () => {
      let rawJSON = this.state.parsedJSON;
      rawJSON = JSON.stringify(rawJSON);
      this.props.renderPanel(rawJSON);
      this.props.setTotalPages(result.pages.length)
    });
  }


  /**
   *
   * @param {*} isNext : true if the next button is pressed
   *
   * return an array with the
   * first index being the correct subsection among all when the click event on the navbar happens
   * second index being the index of the correct subsection among all
   */
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

  /**
   * initialize countmap containing the necessary information
   */
  initCountMap() {
    this.countMap = [];
    this.props.pages.map(
      (section, index) => {
        if (section.elements === undefined) { return; }
        this.countMap.push({
          section: section.name,
          num: 0,
          totalSubSection: section.elements.length,
        });
      },
    );
  }

  /**
   *
   * @param {*} event : the triggering onclick event
   *
   * calling the super component to change questionnaire page to reflect clicking event on the navigation bar
   *
   */
  navigatePanel(event) {
    this.props.onsendPartial();
    for (let i = 0; i < this.hashmap.length; i++) {
      if (this.hashmap[i].ele.elements[0].title == event.target.name) {
        this.props.navigatePanel(this.hashmap[i].number);
      }
    }
  }

  /**
   *
   * @param {*} event : the triggering onclick event
   *
   * calling the super component to render the panel
   */
  renderPanel(event) {
    let json = this.state.curSection.elements;
    json = json.filter(
      (element, index) => element.title === event.target.name,
    )[0];
    json = JSON.stringify(json);
    this.props.renderPanel(json);
  }

  /**
   *
   * @param {*} elements : information about the name of the subsection inside the section
   *
   * adding all the subsections to the navigation bar
   */
  renderSubSection(elements) {
    if (elements === undefined) { return; }
    const subsections = elements.map(
      (element, index) => (
          <li><a
                href="#"
                onClick = {this.navigatePanel}
                id = {element.title}
                name = {element.title}>
              {element.title}
              </a>
          </li>
      ),
    );
    return subsections;
  }

  /**
   * return the entire react component of the nagivation bar
   */
  renderSection() {
    const sections = this.props.pages.map(
      (section, index) => {
        const newID = 'group-'.concat(index + 1);
        return (
          <li>
            <input id={newID} type="checkbox" hidden />
            <label htmlFor={newID}
                   id= {section.name}
                   name = {section.name}
                   value = {index}>
                   <span className="fa fa-angle-right"></span>
                   {section.name}
            </label>
            <ul className="group-list">
              {this.renderSubSection(section.elements)}
            </ul>
          </li>
        );
      },
    );
    return sections;
  }

  /**
   * reset countmap to zero for each section
   */
  cleanCountMap() {
    for (let i = 0; i < this.countMap.length; i++) {
      this.countMap[i].num = 0;
    }
  }

  /**
   *
   * @param {*} isNext : true if the next button is pressed
   *
   * this is currently malfunctioning because of the change in component for navigation bar
   */
  changeNavBarOnClick(isNext) {
    this.setState({
      curSection: [],
    });
    // reset the countmap's num to zero
    this.cleanCountMap();
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
        for (let k = curSubSection.length; k > 0; k--) prevState.displayNavBars.splice(startIndex + 1, 0, curSubSection[k - 1]);
      },
    );
  }

  /**
   * this is for hiding and expanding the navigation bar
   */
  toggleNavBar() {
    this.setState({
      showNavBar: !this.state.showNavBar,
    });
  }

  /**
   * this is the function for the search engine.
   * This search through both the sections and the subsections and
   * only show the ones compatible with the search and hide the rest
   *
   */
  search() {
    let input; let filter; let ul; let li; let a; let
      i;
    input = document.getElementById('mySearch');
    filter = input.value.toUpperCase();
    ul = document.getElementById('myMenu');
    li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
      const temp = li[i].textContent;
      if (temp.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  /**
   * this function checks for whether a page is complete or not.
   *
   * a subsection is only complete if all the questions inside that specific page is finished
   * a section is only complete if all the subsections inside is finished
   *
   * display cross and tick emoji before the name of sections and subsections in the navigation bar
   */
  checkOnComplete() {
    let questionNo = 0;
    const plainData = this.props.survey.getPlainData();
    for (let i = 0; i < this.hashmap.length; i++) {
      const numOfQuestionForSubsection = this.hashmap[i].ele.elements[0].elements.length;
      const subSectionName = this.hashmap[i].ele.elements[0].title;
      let finished = true;
      for (let k = 0; k < numOfQuestionForSubsection; k++) {
        if (plainData[questionNo].value === undefined || plainData[questionNo].value === '') {
          finished = false;
        }
        if(Array.isArray(plainData[questionNo].value) && plainData[questionNo].value.length === 0) {
          finished = false
        }
        this.completedForm[subSectionName] = finished;
        questionNo++;
      }
    }
    let allKeys = Object.keys(this.completedForm);
    for (let i = 0; i < allKeys.length; i++) {
      let key = allKeys[i];

      if (document.getElementById(key) === null) {
        break;
      } else if (this.completedForm[key] == true) {
        document.getElementById(allKeys[i]).innerHTML = '✅   '.concat(allKeys[i]);
      } else {
        document.getElementById(allKeys[i]).innerHTML = '❌   '.concat(allKeys[i]);
      }
    }

    const finishedSection = [];
    if (this.props.pages === undefined) return;
    for (let i = 0; i < this.props.pages.length; i++) {
      const sectionName = this.props.pages[i].name;
      let isFinished = true;
      if (this.props.pages[i].elements === undefined) {
        this.completedMap[sectionName] = false;
      } else {
        for (let j = 0; j < this.props.pages[i].elements.length; j++) {
          const subSection = this.props.pages[i].elements[j].title;
          if (this.completedForm[subSection] == false) {
            isFinished = false;
          }
        }
      }
      this.completedMap[sectionName] = isFinished;
    }

    let completedSections = Object.keys(this.completedMap);
    if (completedSections == undefined) {

    } else {
      for (let i = 0; i < completedSections.length; i++) {
        if (document.getElementById(completedSections[i]) === undefined) {
          break;
        } else {
          const nameForSection = completedSections[i];
          if (document.getElementById(nameForSection) === null) {
            break;
          }
          if (this.completedMap[nameForSection] === true) {
            document.getElementById(completedSections[i]).innerHTML = '✅   '.concat(completedSections[i]);
          } else {
            document.getElementById(completedSections[i]).innerHTML = '❌   '.concat(completedSections[i]);
          }
        }
      }
    }
  }

  render() {
    return (
      <div>
        {this.state.showNavBar
          ? (
        <div>
          <a href="#" className="close" onClick = {this.toggleNavBar}></a>
          <br/>
          <input type="text" id="mySearch" onKeyUp= {this.search} placeholder="Search.." title="Type in a category"/>
          <nav className="nav" role="navigation">
            <ul className="nav__list" id = "myMenu">
              {this.renderSection()}
            </ul>
          </nav>
        </div>)
          : (<div className="container" onClick = {this.toggleNavBar}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>)
        }
        {this.checkOnComplete()}
        </div>
    );
  }
}
