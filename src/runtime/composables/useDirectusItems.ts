import type {
  AsyncDataDirectusReqItem,
  CollectionType,
  DirectusReqOptions,
  DirectusReqItemOptions,
  RegularCollections,
  SingletonCollections,
  Query,
  UnpackList
} from '../types'
import { useAsyncData, computed, toRef, unref } from '#imports'
import { hash } from 'ohash'
import {
  createItem as sdkCreateItem,
  createItems as sdkCreateItems,
  readItem as sdkReadItem,
  readItems as sdkReadItems,
  readSingleton as sdkReadSingleton,
  updateItem as sdkUpdateItem,
  updateItems as sdkUpdateItems,
  updateSingleton as sdkUpdateSingleton,
  deleteItem as sdkDeleteItem,
  deleteItems as sdkDeleteItems
} from '@directus/sdk'

export function useDirectusItems<TSchema extends object> (useStaticToken?: boolean | string) {
  const client = (useStaticToken?: boolean | string) => {
    return useDirectusRest<TSchema>({
      useStaticToken
    })
  }

  async function createItem <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    item: Item,
    options?: DirectusReqItemOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkCreateItem(collection, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't create item", error.errors)
      } else {
        // eslint-disable-next-line no-console
      }
    }
  }

  async function createItems <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>[],
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    items: Item,
    options?: DirectusReqItemOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkCreateItems(collection, items, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't create items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  /**
   * Get a single item from a collection.
   * @param collection The collection name to get the item from.
   * @param id The id of the item to get.
   * @param options The options to use when fetching the item.
   *
   * @returns data: returns an item object if a valid primary key was provided.
   * @returns pending: a boolean indicating whether the data is still being fetched.
   * @returns refresh/execute: a function that can be used to refresh the data returned by the handler function.
   * @returns error: an error object if the data fetching failed.
   * @returns status: a string indicating the status of the data request ("idle", "pending", "success", "error").
   */
  async function readItem <
    Collection extends RegularCollections<TSchema>,
    TQuery extends Query<TSchema, CollectionType<TSchema, Collection>>
  > (
    collection: Ref<Collection> | Collection,
    id: Ref<string | number> | string | number,
    options?: AsyncDataDirectusReqItem<TSchema, TQuery>
  ) {
    const collectionName = toRef(collection) as Ref<Collection>
    const itemId = toRef(id)
    const key = computed(() => {
      return hash([collectionName.value, itemId.value, options?.query, options?.params])
    })
    return await useAsyncData(
      options?.key ?? key.value,
      async () => await client(options?.useStaticToken || useStaticToken)
        .request(sdkReadItem(collectionName.value, itemId.value, options?.query)), options?.params
    )
  }

  /**
   * Get all the items from a collection.
   * @param collection The collection name to get the items from.
   * @param options The options to use when fetching the items.
   *
   * @returns data: an array of up to limit item objects. If no items are available, data will be an empty array.
   * @returns pending: a boolean indicating whether the data is still being fetched.
   * @returns refresh/execute: a function that can be used to refresh the data returned by the handler function.
   * @returns error: an error object if the data fetching failed.
   * @returns status: a string indicating the status of the data request ("idle", "pending", "success", "error").
   */
  async function readItems <
    Collection extends RegularCollections<TSchema>,
    TQuery extends Query<TSchema, CollectionType<TSchema, Collection>>
  > (
    collection: Ref<Collection> | Collection,
    options?: AsyncDataDirectusReqItem<TSchema, TQuery>
  ) {
    const collectionName = toRef(collection) as Ref<Collection>
    const key = computed(() => {
      return hash([unref(collectionName), options?.toString()])
    })
    return await useAsyncData(
      options?.key ?? key.value,
      async () => await client(options?.useStaticToken || useStaticToken)
        .request(sdkReadItems(collectionName.value, options?.query)), options?.params
    )
  }

  /**
   * Get the item from a collection marked as Singleton.
   * @param collection The collection name to get the items from.
   * @param options The options to use when fetching the items.
   *
   * @returns data: an item objects. If no items are available, data will be an empty object.
   * @returns pending: a boolean indicating whether the data is still being fetched.
   * @returns refresh/execute: a function that can be used to refresh the data returned by the handler function.
   * @returns error: an error object if the data fetching failed.
   * @returns status: a string indicating the status of the data request ("idle", "pending", "success", "error").
   */
  async function readSingleton <
    Collection extends SingletonCollections<TSchema>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Ref<Collection> | Collection,
    options?: AsyncDataDirectusReqItem<TSchema, TQuery>
  ) {
    const collectionName = toRef(collection) as Ref<Collection>
    const key = computed(() => {
      return hash([collectionName.value, options?.query, options?.params])
    })
    return await useAsyncData(
      options?.key ?? key.value,
      async () => await client(options?.useStaticToken || useStaticToken)
        .request(sdkReadSingleton(collectionName.value, options?.query)), options?.params
    )
  }

  async function updateItem <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Collection,
    id: string | number,
    item: Item,
    options?: DirectusReqItemOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateItem(collection, id, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update item", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function updateItems <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    ids: string[] | number[],
    item: Item,
    options?: DirectusReqItemOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateItems(collection, ids, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function updateSingleton <
    Collection extends SingletonCollections<TSchema>,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Collection,
    item: Item,
    options?: DirectusReqItemOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateSingleton(collection, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update singleton", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function deleteItem <
    Collection extends keyof TSchema,
    ID extends string | number
  > (
    collection: Collection,
    id: ID,
    options?: DirectusReqOptions
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkDeleteItem(collection, id))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't delete item", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function deleteItems <
    Collection extends keyof TSchema,
    TQuery extends Query<TSchema, TSchema[Collection]>,
    ID extends string[] | number[]
  > (
    collection: Collection,
    idOrQuery: ID | TQuery,
    options?: DirectusReqOptions
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkDeleteItems(collection, idOrQuery))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't delete items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  return {
    createItem,
    createItems,
    readItem,
    readItems,
    readSingleton,
    updateItem,
    updateItems,
    updateSingleton,
    deleteItem,
    deleteItems
  }
}
