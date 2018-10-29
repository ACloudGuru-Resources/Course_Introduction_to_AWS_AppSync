import React from 'react';
import _ from 'lodash';
import { Grid, Progress} from 'semantic-ui-react';

import { Cache, graphqlOperation } from 'aws-amplify';
import { Connect } from 'aws-amplify-react';

import Question from './Question';

// Store answers for a day
const AnswerCache = Cache.createInstance({ storage: window.sessionStorage, keyPrefix: 'answers', defaultTTL: 24*60*60*1000 });

const ListQuizQuestions = `
query MyQuestions ($quizID: ID!){
    getQuiz(id: $quizID) {
        questions (limit: 50) {
            items {
                id
                tags
                text
                explanation
                links
                answers {
                    items { id text correct }
                }
            }
        }
    }
}`;

const ViewScore = ({totalAnswers, correctAnswers}) => {
    if (totalAnswers === 0) {
        return ''
    }
    let color = 'grey';
    if (correctAnswers/totalAnswers > .85) {
        color = 'green'
    } else if (correctAnswers/totalAnswers > .7) {
        color = 'teal'
    } else if (correctAnswers/totalAnswers > .6) {
        color = 'yellow'
    } else if (correctAnswers/totalAnswers > .4) {
        color = 'orange'
    }
    return (
        <Progress color={color} value={correctAnswers} total={totalAnswers} progress='ratio'/>
    )
};


class Quiz extends React.Component {
    constructor(props) {
        super(props);
        //console.log('Read cache of answered question IDs', AnswerCache.getAllKeys());
        this.state = {
            questions: [],
            answeredIds: AnswerCache.getAllKeys() || [],
            totalAnswers: 0,
            correctAnswers: 0,
        };
    }

    answer = (qId) => {
        console.log('User answered', qId);
        AnswerCache.setItem(qId, 1);
        this.setState({
            totalAnswers: this.state.totalAnswers + 1,
            answeredIds: _.concat(this.state.answeredIds, [qId]),
        });
    };

    rightAnswer = () => this.setState({ correctAnswers: this.state.correctAnswers + 1 });

    unansweredQuestions = () => _.filter(
        this.state.questions, o => {
            // Filter out all questions that have been answered except the most recent question.
            return -1 === _.indexOf(this.state.answeredIds, o.id)
        }
    );

    scores = () => <ViewScore
                    totalAnswers={this.state.totalAnswers}
                    correctAnswers={this.state.correctAnswers} />

    render() {
        if (this.props.activeQuiz === null) return []

        return (<div>
            <Connect query={graphqlOperation(ListQuizQuestions, { quizID: this.props.activeQuiz })}>
                {({ data, loading }) => {
                    if (loading || data === null || data.getQuiz === undefined) return []
                    return (<Grid celled>
                        {_.slice(
                            _.filter(
                                data.getQuiz.questions.items, o => {
                                    // Filter out all questions that have been answered except the most recent question.
                                    return -1 === _.indexOf(_.slice(this.state.answeredIds, 0, -1), o.id)
                                }
                            ),
                            0, 3
                        ).map(q => (
                            <Question rightAnswer={this.rightAnswer} answer={this.answer} key={q.id + 'row'} question={q} />
                        ))}
                    </Grid>
                    )
                }}
            </Connect>
            {this.scores()}
        </div>);
    }
}

export default Quiz;
