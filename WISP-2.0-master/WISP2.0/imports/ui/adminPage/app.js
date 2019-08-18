/* eslint-disable no-alert */
/* eslint-disable quotes */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import '../styling/Style.CSS';
import * as Survey from 'survey-react';


const sendJson = gql`

    mutation pushSurvey($json:String!){
        pushSurvey(
            json: $json
            ){
                _id
        }
    }

`;

const updateJson = gql`

    mutation updateSurvey($_id:String!, $json:String, $finished:Boolean){
        updateSurvey(
            _id:$_id,
            json: $json,
            finished:$finished
            ){
                _id
        }
    }

`;

const getSurveys = gql`

query getSurveys{
  getSurveys{
    _id
    json
    date
  }
}

`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prevQuestionnaires: [],
      showPrevQN: false,
    };
    this.prevQN = null;
    this.toggleJSON = this.toggleJSON.bind(this);
    this.copyText = this.copyText.bind(this);
    this.fetchPrevQN = this.fetchPrevQN.bind(this);
    this.downloadText = this.downloadText.bind(this);
    this.setShowToFalse = this.setShowToFalse.bind(this);
    this.closeSurvey = this.closeSurvey.bind(this);
    this.updateSur = this.updateSur.bind(this);
  }

  /**
   *
   * @param {*} event the mouse click event
   * make the property of show to the particular button the alter
   */
  toggleJSON(event) {
    event.persist();
    this.setState(
      (prevState) => {
        const newVal = !prevState.prevQuestionnaires[event.target.name].show;
        prevState.prevQuestionnaires[event.target.name].show = newVal;
        return ({
          prevQuestionnaires: prevState.prevQuestionnaires,
        });
      },
    );
  }

  copyStringToClipboard(str) {
    // Create new element
    const el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
  }

  /**
   *
   * @param {*} event mouse onclick event
   * copy the text the corresponding questionnaire JSON to the clipboard
   */
  copyText(event) {
    const text = this.state.prevQuestionnaires[event.target.name].json;
    this.copyStringToClipboard(text);
  }

  downloadText(event) {
    const text = this.state.prevQuestionnaires[event.target.name].json;
    const createPDF = (survey, username, template) => {
      const QA = (survey.getAllQuestions()).map(qModel => ({ question: qModel.fullTitle, answer: qModel.displayValue }));
      const doc = new jsPDF();
      doc.setFontSize(40);
      doc.text(`Survey`, 55, 20);
      doc.setFontSize(30);
      doc.text(`Questionnaire ID: ${this.state.prevQuestionnaires[event.target.name]._id}`, 20, 35);
      doc.setFontSize(20);


      QA.forEach((element, i) => {
        doc.text(10, 50 + (i * 20),
          `Question: ${element.question
          }\nAnswer: ${element.answer}`);
      });
      doc.save('a4.pdf');
    };
    createPDF(new Survey.Model(JSON.parse(text)));
  }

  closeSurvey(event) {
    this.props.updateSurvey({
      variables: {
        _id: this.state.prevQuestionnaires[event.target.name]._id,
        json: this.state.prevQuestionnaires[event.target.name].json,
        finished: true,
      },
    }).catch((error) => {
      console.log(error);
    });
  }

  updateSur(event) {
    const json = prompt("Enter updated Survey!");

    this.props.updateSurvey({
      variables: {
        _id: this.state.prevQuestionnaires[event.target.name]._id,
        json,
        finished: this.state.prevQuestionnaires[event.target.name].finished,
      },
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   *
   * @param {*} info : the data which is encoded to date information
   *
   * return a react component which shows the date when the questionnaire was made
   */
  renderDate(info) {
    let dateObj = new Date(info);
    dateObj = dateObj.toString();
    return <h3>Made on {dateObj}</h3>;
  }

  /**
   * return a list of buttons of the previous questionnaires, if show is true, also render the JSON
   * also, render a button for copying during hover event
   */
  renderPrevQuestionnaires() {
    if (this.state.prevQuestionnaires === undefined) {
      return;
    }
    const result = this.state.prevQuestionnaires.map(
      (questionnaire, index) => {
        if (questionnaire.show === false) {
          return (
              <div>
              <h2 className = "QLabel">questionnaire {index + 1}</h2>
              {this.renderDate(questionnaire.date)}
              <button
                      name = {index}
                      onClick = {this.toggleJSON}
                      className = "btn default">
                      Click to see this questionnaire
              </button>
            </div>
          );
        }
        return (
              <div>
                <h2 className = "QLabel">questionnaire {index + 1}</h2>
                {this.renderDate(questionnaire.date)}
                <button
                  name = {index}
                  onClick = {this.toggleJSON}
                  className = "btn default">
                    Click to hide this questionnaire
                </button>
                <div className='rowC'>
                  <h3>{questionnaire.json}</h3>
                  <br/>
                  <button onClick = {this.copyText} name = {index} className = "copy" >Copy</button>
                  <button onClick = {this.downloadText} name = {index} className = "copy" >Download</button>
                  <button onClick = {this.updateSur} name = {index} className = "copy" >Update</button>
                  <button onClick = {this.closeSurvey} name = {index} className = "copy" >Close Survey</button>

                </div>
                <br/>
              </div>
        );
      },
    );
    return result;
  }

  /**
   * set the value of prevQuestionnaire to the questionnaires fetched from the data base
   * and also setting the showPrevQN to true 
   */
  fetchPrevQN() {
    this.setState({
      prevQuestionnaires: this.props.getSurveys,
      showPrevQN: true,
    }, () => {
      this.setState(
        (prevState) => {
          prevState.prevQuestionnaires.map(
            (eachQN) => {
              eachQN.show = false;
            },
          );
          return ({
            prevQuestionnaires: prevState.prevQuestionnaires,
          });
        },
      );
    });
  }

  setShowToFalse() {
    this.setState({
      showPrevQN: false,
    });
  }

  /**
   * this function render the correct button for showing or hiding the previous questionnaires
   */
  renderPrevButton() {
    if (this.state.showPrevQN) {
      return (
        <button onClick = {this.setShowToFalse} className = "makingQN" >Hide previous questionnaires</button>
      );
    }

    return (
        <button onClick = {this.fetchPrevQN} className = "makingQN" >See previous questionnaires</button>
    );
  }

  render() {
    const submit = () => {
      this.props.pushSurvey({
        variables: {
          json: this.surveyJson.value,
        },
      }).catch((error) => {
        console.log(error);
      });
    };

    const openInNewTab = () => {
      // eslint-disable-next-line no-undef
      const win = window.open('https://surveyjs.io/create-survey/', '_blank');
      win.focus();
    };

    return (
            <div>

              <ul className = "topnav">
                <li><button>Log In</button></li>
                <li><button>Information</button></li>
                <li><button>Contact</button></li>
              </ul>

              <header className = "topHeader">
                <h1>Administrator Side</h1>
                <div className = "labels">
                  <label value = "security" onClick = {() => this.changeTextOnDropdown}>Security Department</label>
                  <label value = "purpose" onClick = {() => this.changeTextOnDropdown}>Purpose</label>
                  <div className="dropdown-content">
                    <h1>Hello World!</h1>
                  </div>
                </div>
              </header>
              <img
                className = "cornellLogo"
                src = "https://static.wixstatic.com/media/865a93_ab56eb87513f4ad6933e99f6a538e581~mv2_d_2000_2000_s_2.png" alt = "logo" ></img>
              <h2 className = "cornellName">Cornell University</h2>
              <br/>
              <button onClick={openInNewTab} className = "makingQN">Click here to make a questionnaire</button>
              <br/>
              <br/>
              {this.renderPrevButton()}
              {/* <button onClick = {this.fetchPrevQN} className = "makingQN" >see previous questionnaires</button> */}
              {this.state.showPrevQN ? this.renderPrevQuestionnaires() : null}
                <div>
                  <br/>
                  <br/>
                  <input type="textarea" ref={input => this.surveyJson = input } className = "textarea"/>
                  <button onClick={submit} className = "submit">Submit</button>
                </div>
            </div>
    );
  }
}

export default compose(
  graphql(sendJson, {
    name: 'pushSurvey',
  }),
  graphql(getSurveys, { props: ({ data }) => ({ ...data }) }),
  graphql(updateJson, {
    name: 'updateSurvey',
  }),
)(App);
