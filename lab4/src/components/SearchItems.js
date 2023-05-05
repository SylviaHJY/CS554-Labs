import React, { useState } from 'react';

const SearchItems = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setError(null);
      props.searchValue(searchTerm.trim());
    } else {
      setError('Please enter a valid search term');
    }
  };

  return (
    <form
      method="POST"
      onSubmit={handleSearch}
      name="formName"
      className="center"
    >
      <label>
        <span>Search Here: </span>
        <input
          autoComplete="off"
          type="text"
          name="searchTerm"
          value={searchTerm}
          onChange={handleChange}
        />
      </label>
      {error && <p>{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
};

export default SearchItems;

