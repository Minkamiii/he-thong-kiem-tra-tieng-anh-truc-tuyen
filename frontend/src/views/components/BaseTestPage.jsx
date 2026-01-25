import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Provider } from 'react-redux';
import { TestStore } from '../states/TestStore.jsx';
import BaseTestUI from './BaseTestUI.jsx';

const BaseTestPage = () => {
    const { testId } = useParams();
    const [searchParams] = useSearchParams();
    const tasks = searchParams.getAll('task'); // returns array of selected tasks
    return (
        <Provider store={TestStore}>
            <BaseTestUI testId={testId} tasks={tasks} />
        </Provider>
    );
}

export default BaseTestPage;