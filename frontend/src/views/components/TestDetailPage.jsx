import React from 'react';
import { useParams } from 'react-router-dom';
import TestDetailView from './TestDetailView';
import { Provider } from 'react-redux';
import { TestStore } from '../states/TestStore.jsx';

const TestDetailPage = ({isLoggedIn = false, user = null}) => {
    const { testId } = useParams();
    return (
        <Provider store={TestStore}>
            <TestDetailView testId={testId} isLoggedIn={isLoggedIn} user={user} />
        </Provider>
    );
};

export default TestDetailPage;