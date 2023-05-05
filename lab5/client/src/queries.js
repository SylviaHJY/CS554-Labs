import { gql } from "@apollo/client";

// Queries
const GET_LOCATION_POSTS = gql`
  query GetLocationPosts($pageNum: Int!) {
    locationPosts(pageNum: $pageNum) {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;


const GET_LIKED_LOCATIONS = gql`
  query GetLikedLocations {
    likedLocations {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;

const GET_USER_POSTED_LOCATIONS = gql`
  query GetUserPostedLocations {
    userPostedLocations {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;

// Mutations
const UPLOAD_LOCATION = gql`
  mutation UploadLocation($image: String!, $address: String!, $name: String!) {
    uploadLocation(image: $image, address: $address, name: $name) {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;

const UPDATE_LOCATION = gql`
  mutation UpdateLocation(
    $id: ID!
    $image: String
    $name: String
    $address: String
    $userPosted: Boolean
    $liked: Boolean
  ) {
    updateLocation(
      id: $id
      image: $image
      name: $name
      address: $address
      userPosted: $userPosted
      liked: $liked
    ) {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;

const DELETE_LOCATION = gql`
  mutation DeleteLocation($id: ID!) {
    deleteLocation(id: $id) {
      id
      image
      name
      address
      userPosted
      liked
    }
  }
`;

const CLEAR_LIKED_LOCATIONS = gql`
  mutation ClearLikedLocations {
    clearLikedLocations
  }
`;

const CLEAR_USER_POSTED_LOCATIONS = gql`
  mutation ClearUserPostedLocations {
    clearUserPostedLocations
  }
`;

let exported = {
  GET_LOCATION_POSTS,
  GET_LIKED_LOCATIONS,
  GET_USER_POSTED_LOCATIONS,
  UPLOAD_LOCATION,
  UPDATE_LOCATION,
  DELETE_LOCATION,
  CLEAR_LIKED_LOCATIONS,
  CLEAR_USER_POSTED_LOCATIONS,
};

export default exported;