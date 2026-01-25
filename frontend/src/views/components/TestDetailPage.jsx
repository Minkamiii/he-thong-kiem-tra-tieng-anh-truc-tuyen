import React from 'react';
import { useParams } from 'react-router-dom';
import TestDetailView from '../TestDetailView.jsx';
import { Provider } from 'react-redux';
import { TestStore } from '../states/TestStore.jsx';

const TestDetailPage = () => {
    const { testId } = useParams();
    return (
        <Provider store={TestStore}>
            <TestDetailView testId={testId} />
        </Provider>
    );
};

export default TestDetailPage;