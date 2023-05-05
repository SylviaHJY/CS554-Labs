import { ApolloServer} from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {v4 as uuid} from 'uuid';
import fetch from 'node-fetch';
import redis from 'redis';
const client = redis.createClient();


const typeDefs = `#graphql
  type Query {
    locationPosts(pageNum:Int): [Location]
    likedLocations: [Location]
    userPostedLocations: [Location]
  }

  type Location {
    id: ID!
    image: String!
    name: String!
    address: String
    userPosted: Boolean!
    liked: Boolean!
  }

  type Mutation {
    uploadLocation(image: String!, address: String, name: String): Location
    updateLocation(
      id: ID!
      image: String
      name: String
      address: String
      userPosted: Boolean
      liked: Boolean
    ): Location
    deleteLocation(id: ID!): Location
    clearLikedLocations: String
    clearUserPostedLocations: Boolean
  }
`;

const resolvers = {
  Query: {
    locationPosts: async(_, {pageNum}) => {
       if (pageNum <= 0 || pageNum > 5) {
         throw new Error("404 page not found, no more data");
       }
       
       await client.connect();
       const url = "https://api.foursquare.com";
       const headers = {
         Accept: "application/json",
         Authorization: 'fsq3I5BTxPTlOaF2HKpk9IObtT1vce9pTPiiitDMXqK58sU=',
       };
       try {
        // Fetch liked locations
        const locationsData = await client.hGetAll('liked');
        const likedLocations = locationsData ? Object.values(locationsData).map(JSON.parse) : [];  
        const response = await fetch(`${url}/v3/places/search?limit=${pageNum * 10}`, {
          method: "GET",
          headers
        });               
        const data1 = await response.json();
        //console.log(data1);
        //console.log("1111");
        const data = data1.results;
        const locations = data.map(async (location) => {
          const fsq_id = location.fsq_id;
          const name = location.name;
          const address = location.location.address || "";
          const imageUrl = `${url}/v3/places/${fsq_id}/photos`;
          const imageResponse = await fetch(imageUrl, { headers });
          const imageResponseData = await imageResponse.json();
          //console.log(imageResponseData);
          //console.log("2222");
          const photo = imageResponseData[0];
          const image = photo
            ? `${photo.prefix}300x300${photo.suffix}`
            : "";
          //Array.prototype.some() 方法接受一个回调函数作为参数，对数组中的每个元素执行回调函数，如果回调函数对任意一个元素返回 true，则 some() 方法返回 true，否则返回 false。
          const liked = likedLocations.length > 0 ? likedLocations.some((likedLocation) => likedLocation.id === fsq_id) : false;
          return {
            id: fsq_id,
            image,
            name,
            address,
            userPosted: false,
            liked
          };
        });      
         return Promise.all(locations);
       } catch (e) {
         console.log(e);
       }finally {
         client.disconnect();
       }
    },

    likedLocations: async () => {
      await client.connect();
      try {
        const locationsData = await client.hGetAll('liked');
        const locations = Object.values(locationsData).map(JSON.parse);
        //console.log(locations);
        return locations;
      } catch (e) {
        console.log(e);
        throw new Error('Failed to fetch liked locations');
      } finally {
        client.disconnect();
      }
    },

    userPostedLocations: async () => {
      await client.connect();
      try {
        const locationsData = await client.hGetAll('userPosted');
        const locations = Object.values(locationsData).map(JSON.parse);
        //console.log(locations);
        return locations;
      } catch (e) {
        console.log(e);
        throw new Error('Failed to fetch user posted locations');
      } finally {
        client.disconnect();
      }
    },
  },

  Mutation: {
    uploadLocation: async (_, {image, address, name}) => {
      // Check if image is provided
      if (!image || !address || !name) {
        throw new Error('Image is required to upload a location');
      }

      if(typeof image !== 'string' || typeof address !== 'string' || typeof name !== 'string') {
        throw new Error('Invalid input');
      }

      const id = uuid();
      const location = {
        id,
        image,
        address,
        name,
        userPosted: true,
        liked: false
      };
      await client.connect();
      try {
        await client.hSet('userPosted', id, JSON.stringify(location));
      } catch (e) {
        console.log(e);
        throw new Error('Failed to upload location');
      } finally {
        client.disconnect();
      }
      return location;
    },

    updateLocation: async (_, {id, image, name, address, userPosted, liked}) => {
      if(!id) {
        throw new Error('ID is required to update a location');
      }
      await client.connect();
      try {
        const exits = await client.hExists('userPosted', id);
        console.log("exits:", exits);
        if(exits) {
          let location = await client.hGet('userPosted', id);
          location = JSON.parse(location);

          location.image = image || location.image;
          location.name = name || location.name;
          location.address = address || location.address;
          location.userPosted = userPosted !== undefined ? userPosted : location.userPosted;
          location.liked = liked !== undefined ? liked : location.liked;

          await client.hSet('userPosted', id, JSON.stringify(location));
          await client.hSet('liked', id, JSON.stringify(location));
          return location;
        } else {
          //console.log('345');
          const url = "https://api.foursquare.com";
          const headers = {
            Accept: "application/json",
            Authorization: 'fsq3I5BTxPTlOaF2HKpk9IObtT1vce9pTPiiitDMXqK58sU=',
          };

          const response = await fetch(`${url}/v3/places/${id}`, { headers });
          const location = await response.json();
          console.log(location);
          if(location) {
            const imageUrl = `${url}/v3/places/${id}/photos`;
            const imageResponse = await fetch(imageUrl, { headers });
            const imageResponseData = await imageResponse.json();
            const photo = imageResponseData[0];
            const imageOriginal = photo
              ? `${photo.prefix}original${photo.suffix}`
              : "";

            const newLocation = {
              id : location.fsq_id,
              image: image || imageOriginal,
              name: name || location.name,
              address: address || location.location.address,
              userPosted: false,
              liked: liked || false
            };           

            if (liked === true) {
              await client.hSet('liked', id, JSON.stringify(newLocation));
            } else if (liked === false && await client.hExists('liked', id)) {
              await client.hDel('liked', id);
            } 

            return newLocation;
          } else {
            throw new Error('Location not found');
          }
        }
      } catch (e) {
        console.log(e);
        throw new Error('Failed to update location');
      } finally {
        client.disconnect();
      }
    },

    deleteLocation: async (_, { id }) => {
      // Check if id is provided
      if (!id) {
        throw new Error('ID is required to delete a location');
      }

      await client.connect();
      try {
        const location = await client.hGet('userPosted', id);
        if (location) {
          await client.hDel('userPosted', id);
          // Check if the location exists in the liked cache and remove it
          const likedLocation = await client.hGet('liked', id);
          if (likedLocation) {
            await client.hDel('liked', id);
          }
          return JSON.parse(location);
        } else {
          throw new Error('Location not found');
        }
      } catch (e) {
        console.log(e);
        throw new Error('Failed to delete location');
      } finally {
        client.disconnect();
      }
    },

    clearLikedLocations: async () => {
      await client.connect();
      try {
        const likedLocationsData = await client.hGetAll('liked');
        const likedLocationKeys = Object.keys(likedLocationsData);
        for (const key of likedLocationKeys) {
          await client.hDel('liked', key);
        }
        return "Liked locations cache cleared.";
      } catch (e) {
        console.log(e);
        throw new Error('Failed to clear liked locations cache');
      } finally {
        client.disconnect();
      }
    },

    clearUserPostedLocations: async () => {
      await client.connect();
      try {
        await client.del('userPosted');
        return true;
      } catch (e) {
        console.log(e);
        throw new Error('Failed to clear user posted locations');
      } finally {
        client.disconnect();
      }
    },
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at ${url}`);




    