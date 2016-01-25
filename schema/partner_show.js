import gravity from '../lib/loaders/gravity';
import cached from './fields/cached';
import date from './fields/date';
import markdown from './fields/markdown';
import Artist from './artist';
import Partner from './partner';
import Fair from './fair';
import Artwork from './artwork';
import Location from './location';
import Image from './image';
import PartnerShowEventType from './partner_show_event';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql';

const PartnerShowType = new GraphQLObjectType({
  name: 'PartnerShow',
  fields: () => ({
    cached,
    _id: {
      type: GraphQLString,
    },
    id: {
      type: GraphQLString,
    },
    href: {
      type: GraphQLString,
      resolve: (partnerShow) => `/show/${partnerShow.id}`,
    },
    name: {
      type: GraphQLString,
      description: 'The exhibition title',
    },
    description: {
      type: GraphQLString,
    },
    displayable: {
      type: GraphQLBoolean,
    },
    press_release: markdown,
    start_at: date,
    end_at: date,
    artists: {
      type: new GraphQLList(Artist.type),
      resolve: ({ artists }) => artists,
    },
    partner: {
      type: Partner.type,
      resolve: ({ partner }) => partner,
    },
    fair: {
      type: Fair.type,
      resolve: ({ fair }) => fair,
    },
    location: {
      type: Location.type,
      resolve: ({ location, fair_location }) => location || fair_location,
    },
    status: {
      type: GraphQLString,
    },
    events: {
      type: new GraphQLList(PartnerShowEventType),
      resolve: ({ events }) => events,
    },
    artworks: {
      type: new GraphQLList(Artwork.type),
      args: {
        size: {
          type: GraphQLInt,
          description: 'Number of artworks to return',
        },
        published: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        page: {
          type: GraphQLInt,
        },
      },
      resolve: (show, options) => {
        return gravity(`partner/${show.partner.id}/show/${show.id}/artworks`, options);
      },
    },
    cover_image: {
      type: Image.type,
      resolve: ({ id }, options) => {
        return gravity(`partner_show/${id}/default_image`, options)
          .then(Image.resolve)
          // Shows without a default_image reject with a 404
          .catch(() => null);
      },
    },
    images: {
      type: new GraphQLList(Image.type),
      args: {
        size: {
          type: GraphQLInt,
          description: 'Number of images to return',
        },
        default: {
          type: GraphQLBoolean,
          description: 'Pass true/false to include cover or not',
        },
        page: {
          type: GraphQLInt,
        },
      },
      resolve: ({ id }, options) => {
        return gravity(`partner_show/${id}/images`, options)
          .then(Image.resolve);
      },
    },
  }),
});

const PartnerShow = {
  type: PartnerShowType,
  description: 'A Partner Show',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The slug or ID of the PartnerShow',
    },
  },
  resolve: (root, { id }) => {
    return gravity(`show/${id}`);
  },
};

export default PartnerShow;
