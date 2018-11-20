import React, { Component } from 'react';
import { graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';
import _ from 'lodash';
import { Menu, Dropdown } from 'semantic-ui-react';
import QuizInput from './QuizInput';

const SubscribeToQuizzes = `
subscription OnCreateQuiz {
  onCreateQuiz {
    id
    title
  }
}
`;

const ListQuizzes = `
query MyQuizzes {
    listQuizzes(limit: 5) {
        nextToken
        items {
            id
            title
        }
    }
}`;

class QuizPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalActive: false,
        };
    }

    handleItemClick = (e, { name }) => {
        this.props.propagateQuiz(name)
    };

    closeModal = () => this.setState({modalActive: false})
    openModal = () => this.setState({modalActive: true})
    renderDropdowns = (data) => {

        if (data.listQuizzes.items.length === 0) {
            return []
        }
        return [
                (<Menu.Item key='current' name={'current-' + this.props.activeQuiz} active={!this.state.modalActive}>{
                    this.props.activeQuiz ? _.head(_.filter(data.listQuizzes.items, q => q.id === this.props.activeQuiz)).title : 'Choose a quiz!'
                }</Menu.Item>),
                (<Dropdown key='options' item text="Choose Another">
                    <Dropdown.Menu>
                        {_.map(_.filter(_.sortBy(data.listQuizzes.items, 'title'), q => q.id !== this.props.activeQuiz), q => {
                            return (
                                <Dropdown.Item
                                    key={q.id}
                                    name={q.id}
                                    active={false}
                                    onClick={this.handleItemClick}
                                >{q.title}</Dropdown.Item>
                            )
                        })}
                    </Dropdown.Menu>
                </Dropdown>)
            
        ]
    }
    render() {
        return (
            <Connect
            query={graphqlOperation(ListQuizzes)}
            subscription={graphqlOperation(SubscribeToQuizzes)}
            onSubscriptionMsg={(prev, data) => {
                console.log("New quiz created:", {prev: prev, newData: data} );
                prev.listQuizzes.items = _.concat(prev.listQuizzes.items, [{
                    id: data.onCreateQuiz.id,
                    title: data.onCreateQuiz.title
                }])
                return prev
            }}
            >
                {({ data, loading }) => {
                    if (loading || data === undefined || data === null || data.listQuizzes === undefined) return []
                    return (
                        <Menu>
                            {this.renderDropdowns(data)}
                            <Menu.Item
                            name={'new-question'}
                            active={this.state.modalActive}
                            onClick={this.openModal}
                            >{
                               <QuizInput
                                 modalActive={this.state.modalActive}
                                 onClose={this.closeModal}
                                 activeQuiz={this.props.activeQuiz}
                                 quizzes={data.listQuizzes.items} />
                            }</Menu.Item>
                        </Menu>
                    )
                }
                }
            </Connect>
        )
    }
}

export default QuizPicker;
