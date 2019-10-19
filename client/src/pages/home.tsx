import React from 'react';
import { useUsersQuery } from '../generated/graphql';

export const Home: React.FC = (props) => {
  console.log('PROPS', props);
  const { data, loading } = useUsersQuery();

  if (loading || !data) {
    return <div>loading...</div>;
  }

  console.log('DATA', data);

  return (
    <ul>
      {data.users.map((user) => (
        <li>{user.email}</li>
      ))}
    </ul>
  );
};
