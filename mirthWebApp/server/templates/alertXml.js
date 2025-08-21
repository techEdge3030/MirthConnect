import { create } from 'xmlbuilder2';

export function buildAlertXml(alert) {
  const doc = create({ version: '1.0' });
  const alertModel = doc.ele('alertModel', { version: '4.5.2' });
  alertModel.ele('id').txt(alert.id).up();
  alertModel.ele('name').txt(alert.name).up();
  alertModel.ele('enabled').txt(alert.enabled ? 'true' : 'false').up();

  // Trigger
  const trigger = alertModel.ele('trigger', { class: 'defaultTrigger', version: '4.5.2' });

  // alertChannels
  const channels = alert.trigger?.alertChannels || {};
  const alertChannels = trigger.ele('alertChannels', { version: '4.5.2' });
  alertChannels.ele('newChannelSource').txt(channels.newChannelSource ? 'true' : 'false').up();
  alertChannels.ele('newChannelDestination').txt(channels.newChannelDestination ? 'true' : 'false').up();

  // enabledChannels: convert from webapp object structure
  const enabledChannels = alertChannels.ele('enabledChannels');
  if (channels && typeof channels === 'object') {
    Object.entries(channels).forEach(([channelId, channelObj]) => {
      if (channelObj && channelObj.enabled) {
        enabledChannels.ele('string').txt(channelId).up();
      }
    });
  }
  enabledChannels.up();

  // disabledChannels (not handled in webapp structure, so leave empty)
  alertChannels.ele('disabledChannels').up();
  // partialChannels (not implemented)
  alertChannels.ele('partialChannels').up();
  alertChannels.up();

  // errorEventTypes
  const errorTypes = trigger.ele('errorEventTypes');
  (alert.trigger?.errorEventTypes || []).forEach(type => errorTypes.ele('errorEventType').txt(type).up());
  errorTypes.up();

  // regex
  trigger.ele('regex').txt(alert.trigger?.regex || '').up();
  trigger.up();

  // actionGroups
  const actionGroups = alertModel.ele('actionGroups');
  (alert.actionGroups || []).forEach(group => {
    const groupEle = actionGroups.ele('alertActionGroup', { version: '4.5.2' });
    // actions
    const actionsEle = groupEle.ele('actions');
    (group.actions || []).forEach(action => {
      const actionEle = actionsEle.ele('alertAction', { version: '4.5.2' });
      actionEle.ele('protocol').txt(action.protocol).up();
      actionEle.ele('recipient').txt(action.recipient).up();
      actionEle.up();
    });
    actionsEle.up();
    groupEle.ele('subject').txt(group.subject || '').up();
    groupEle.ele('template').txt(group.template || '').up();
    groupEle.up();
  });
  actionGroups.up();

  // properties (empty)
  alertModel.ele('properties').up();

  return doc.end({ prettyPrint: true });
} 