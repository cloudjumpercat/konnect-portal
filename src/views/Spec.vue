<template>
  <div
    :ref="specDetails"
    :class="{ spec: true, 'mt-6': true, 'api-documentation': true }"
  >
    <div class="container mx-auto max-w-screen-2xl px-5 md:px-0">
      <div class="swagger-ui has-sidebar breadcrumbs">
        <KBreadcrumbs :items="breadcrumbs" />
      </div>
    </div>
    <div class="container mx-auto max-w-screen-2xl px-5 md:px-0">
      <EmptyState
        v-if="hasServiceError"
        is-error
        class="mt-6"
        :message="hasServiceError"
      />
    </div>

    <div
      v-if="hasServiceError"
      class="spec-render-error"
    />

    <div
      v-else-if="loading"
      class="spec-loading-container"
    >
      <div>
        <KIcon
          icon="spinner"
          size="96"
          color="var(--steel-300)"
        />
      </div>
    </div>

    <SpecDetails
      v-else-if="spec"
      class="w-100"
      :document="spec"
      :has-sidebar="false"
      :application-registration-enabled="applicationRegistrationEnabled"
      :active-operation="sidebarActiveOperationListItem"
      :current-version="currentVersion.name"
      @clicked-view-spec="triggerViewSpecModal"
      @clicked-register="triggerViewSpecRegistrationModal"
    />

    <ViewSpecModal
      :is-visible="viewSpecModalIsVisible"
      :spec-contents="specContents"
      :spec-name="specName"
      :download-callback="downloadSpecContents"
      @close="closeModal"
    />
    <ViewSpecRegistrationModal
      :initial-selected-application="($route.query.application as string)"
      :is-visible="viewSpecRegistrationModalIsVisible"
      :service="service"
      :version="currentVersion"
      @close="closeModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, toRaw, ComputedGetter } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import jsyaml from 'js-yaml'

import getMessageFromError from '@/helpers/getMessageFromError'
import ViewSpecModal from '@/components/ViewSpecModal.vue'
import ViewSpecRegistrationModal from '@/components/ViewSpecRegistrationModal.vue'
import usePortalApi from '@/hooks/usePortalApi'
import { useI18nStore, useAppStore, usePermissionsStore, useProductStore } from '@/stores'
import { OperationListItem, SpecDetails } from '@kong-ui-public/spec-renderer'
import { idFromPathMethod } from '@/helpers/generatedOperationId'
import '@kong-ui-public/spec-renderer/dist/style.css'
import { ProductVersionSpec } from '@kong/sdk-portal-js'

export default defineComponent({
  name: 'Spec',
  components: {
    SpecDetails,
    ViewSpecModal,
    ViewSpecRegistrationModal
  },
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    const loading = ref(false)
    const spec = ref(null)
    const currentVersion = ref(null)
    const hasServiceError = ref(null)
    const viewSpecModalIsVisible = ref(false)
    const viewSpecRegistrationModalIsVisible = ref(false)
    const isAllowedToRegister = ref(false)
    const specContents = ref('')
    const specName = ref('')
    const specDetails = ref(null)
    const serviceVersions = ref(new Map())
    const { canUserAccess } = usePermissionsStore()
    const appStore = useAppStore()
    const { isPublic } = storeToRefs(appStore)

    const objectParsers = [
      (x: string) => JSON.parse(x),
      (x: string) => jsyaml.load(x)
    ]

    const applicationRegistrationEnabled = computed(() => {
      return currentVersion.value.registration_configs?.length && isAllowedToRegister.value
    })

    const helpText = useI18nStore().state.helpText

    const productStore = useProductStore()
    const { sidebarActiveOperation, sidebarOperations } = storeToRefs(productStore)

    // converting Operation to OperationListItem
    const convertOperationToListItem: ComputedGetter<OperationListItem|null> = () => {
      if (sidebarActiveOperation.value) {
        const { tags, ...props } = sidebarActiveOperation.value
        const tag = props.tag ? props.tag : tags[0]

        return {
          ...props,
          tag
        }
      } else {
        return null
      }
    }
    const sidebarActiveOperationListItem = computed(convertOperationToListItem)

    const breadcrumbs = [{
      key: 'service-catalog',
      to: { name: 'catalog' },
      text: helpText.nav.catalog
    }]

    const $router = useRouter()
    const $route = useRoute()
    const { portalApiV2 } = usePortalApi()

    // fallback in case the operations are loaded in after the spec.
    watch(() => sidebarOperations.value, async () => {
      if (sidebarOperations.value?.length) {
        // this means that user initially routed to a spec - check if
        // hash is present in route, if it is, we scroll to it
        const routeHash = $router.currentRoute.value?.hash
        if (routeHash) {
          scrollToHash(routeHash)
        }
      }
    })

    watch(() => props.service, async () => {
      isAllowedToRegister.value = await canUserAccess({
        service: 'konnect',
        action: '#consume',
        resourcePath: `services/${$route.params.service_package}`
      })

      await processService()
      await loadSwagger().then(() => {
        if (sidebarOperations.value.length) {
          // this means that user initially routed to a spec - check if
          // hash is present in route, if it is, we scroll to it
          const routeHash = $router.currentRoute.value?.hash
          if (routeHash) {
            scrollToHash(routeHash)
          }
        }
      })

      // trigger registration modal if an application param is passed
      if ($route.query.application) {
        viewSpecRegistrationModalIsVisible.value = true
      }
    })

    watch(() => $route.params.service_version, async (serviceVersionId) => {
      if (serviceVersionId) {
        isAllowedToRegister.value = await canUserAccess({
          service: 'konnect',
          action: '#consume',
          resourcePath: `services/${$route.params.service_package}`
        })

        // this is not called on page load, but will be called when back button clicked and on select

        await loadSwagger()
      }
    })

    onMounted(async () => {
      isAllowedToRegister.value = await canUserAccess({
        service: 'konnect',
        action: '#consume',
        resourcePath: `services/${$route.params.service_package}`
      })

      await processService()
      await loadSwagger()

      // trigger registration modal if an application param is passed
      if ($route.query.application) {
        viewSpecRegistrationModalIsVisible.value = true
      }
    })

    function triggerViewSpecModal () {
      viewSpecModalIsVisible.value = true
      specContents.value = getSpecContents()
    }

    function triggerViewSpecRegistrationModal () {
      viewSpecRegistrationModalIsVisible.value = true
    }

    function closeModal () {
      viewSpecModalIsVisible.value = false
      viewSpecRegistrationModalIsVisible.value = false
    }

    function scrollToHash (routeHash: string) {
      // split and find the operation id which should be the last item
      // if it is a valid, tagged operation
      const tag = routeHash.split('/').slice(-2)[0]
      const operationId = routeHash.split('/').slice(-1)[0]
      const nonProxiedOperations = toRaw(sidebarOperations.value)

      if (nonProxiedOperations.length) {
        const linkedOperation = nonProxiedOperations.find((operation) => {
          if (operation.operationId) {
            return operation.operationId === operationId
          } else {
            // since there is no operation id, we check the generated value
            const generatedOperationId = idFromPathMethod(operation.path, operation.method)

            return generatedOperationId === operationId
          }
        })

        if (linkedOperation) {
          linkedOperation.tag = tag || linkedOperation.tags[0]
          delete linkedOperation.tags
          productStore.setSidebarActiveOperation(linkedOperation)
        }
      }
    }

    function downloadSpecContents (): void {
      let extension: string
      let fileName: string
      const content = specContents.value
      const element = document.createElement('a')

      try {
        JSON.parse(content)
        extension = '.json'
      } catch (e) {
        extension = '.yaml'
      }

      if (window.location.pathname.includes('/')) {
        const splitPath = window.location.pathname.split('/')

        fileName = splitPath[splitPath.length - 1]
      } else {
        fileName = window.location.pathname
      }

      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(specContents.value))
      element.setAttribute('download', fileName + extension)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }

    function getSpecContents () {
      return JSON.stringify(spec.value, null, 2)
    }

    function setTitle (versionName: string) {
      const versionText = versionName ? `- ${versionName} ` : ''

      if (props.service) {
        document.title = `${props.service.name} ${versionText}| Developer Portal`
      } else {
        document.title = 'Developer Portal'
      }
    }

    async function processService () {
      if (!props.service) {
        return
      }

      props.service.versions
        .slice()
        .sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .forEach(version => {
          serviceVersions.value.set(version.id, {
            ...version,
            dropdownLabel: `${version.name}${version.deprecated ? ' (Deprecated)' : ''}`
          })
        })
    }

    async function fetchSpec (version: string) {
      loading.value = true

      return await portalApiV2.value.service.versionsApi.getProductVersionSpec({
        productId: $route.params.service_package as string,
        versionId: version
      })
        .then(async res => {
          // no content
          if (res.status === 204) {
            res.data = {} as ProductVersionSpec

            return res
          }

          const rawContent = res.data.content

          let parsedObject: any
          const parseErrors = []

          for (const parser of objectParsers) {
            try {
              parsedObject = parser(rawContent)
              if (parsedObject) {
                break
              }
            } catch (err) {
              parseErrors.push(err)
            }
          }

          if (!parsedObject) {
            console.error(['Failed to parse spec', ...parseErrors].join(', '))

            return res
          }

          res.data = parsedObject

          return res
        })
        .catch(e => {
          return e.response
        })
        .finally(() => {
          loading.value = false
        })
    }

    async function loadSwagger () {
      if (!props.service) {
        return
      }

      const serviceVersion = $route.params.service_version
      const servicePackage = $route.params.service_package

      let serviceVersionId

      if (serviceVersion) {
        try {
          serviceVersionId = decodeURIComponent(serviceVersion as string)
        } catch (e) {
          serviceVersionId = serviceVersion
        }
      }

      if (!serviceVersionId && serviceVersions.value.size > 0) {
        // Redirect when missing service version id
        // to first available service version of service package
        const id = Array.from(serviceVersions.value).pop()[0]

        $router.replace({
          name: 'spec',
          params: {
            service_version: encodeURIComponent(id),
            service_package: servicePackage
          }
        })

        return // return because the route change will trigger load swagger again
      }

      const currentServiceVersion = serviceVersions.value.get(serviceVersionId)

      if (!currentServiceVersion && serviceVersions.value.size > 0) {
        // Fallback to previous implementation when we had serviceVersion name in url
        // instead of serviceVersion id. In that case variable serviceVersionId is serviceVersion name
        // Also it handles a situation when non-exisitng id/name will be provided

        const serviceVersion = Array.from(serviceVersions.value.values()).find((serviceVersion) => {
          return serviceVersion.name === serviceVersionId
        })

        $router.replace({
          name: 'spec',
          params: {
            service_version: serviceVersion?.id && encodeURIComponent(serviceVersion?.id),
            service_package: servicePackage
          }
        })

        return // return because the route change will trigger load swagger again
      }

      setTitle(currentServiceVersion?.name)

      if (currentServiceVersion) {
        currentVersion.value = currentServiceVersion
      }

      // if we have a service version, fetch the spec
      if (currentServiceVersion?.id && $route.params.service_package) {
        try {
          const specResponse = await fetchSpec(serviceVersionId)

          spec.value = specResponse.data

          // detect 404 for usage in swagger-ui-kong-theme-universal
          if (specResponse.status === 404 || specResponse.status === 204) {
            spec.value.statusCode = 404
          }

          if (specResponse.status !== 200 && specResponse.status !== 204) {
            throw Error(getMessageFromError(specResponse))
          }
        } catch (e) {
          console.error(e)
        }
      }
    }

    return {
      helpText,
      viewSpecModalIsVisible,
      viewSpecRegistrationModalIsVisible,
      specContents,
      specName,
      sidebarActiveOperationListItem,
      spec,
      loading,
      currentVersion,
      hasServiceError,
      isPublic,
      breadcrumbs,
      downloadSpecContents,
      closeModal,
      specDetails,
      applicationRegistrationEnabled,
      triggerViewSpecModal,
      triggerViewSpecRegistrationModal
    }
  }
})
</script>

<style lang="scss">
.spec {
  .deprecated-alert {
    padding: 14px;
    font-family: inherit;
    font-size: 1rem;
    border-radius: 4px;
    color: var(--KAlertWarningColor, var(--yellow-500, color(yellow-500)));
    border-color: var(--KAlertWarningBorder, var(--yellow-200, color(yellow-200)));
    background-color: var(--KAlertWarningBackground, var(--yellow-100, color(yellow-100)));
  }

  .container .breadcrumbs {
    position: relative;
    left: var(--spacing-xs)
  }

  .swagger-ui .version-pragma {
    display: none;
  }

  .header-anchor {
    position: relative;

    svg {
      position: absolute;
      left: -1.5rem;
      bottom: 0;
    }
  }
}

.spec-loading-container {
  align-items: center;
  background-color: var(--white, #fff);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10000;
}

.spec.api-documentation .breadcrumbs {
  margin-left: 0;
}
</style>
