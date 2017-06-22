import {Field} from './field';

/**
 * Collapsiblefield is a {@link Field} that can be collapsed. Usually
 * collapsible fields have one or more children.
 */
export class Collapsiblefield extends Field {
  /**
   * Whether or not the UI element should be collapsed (i.e. only show the title)
   * @type {Boolean}
   */
  collapsed = false;
  /**
   * Whether or not collapsing this field should be allowed.
   */
  isCollapsible = true;

  /**
   * Called when a child of this field changes its collapsed status.
   * @param  {Field}   field          The field that was collapsed/uncollapsed.
   * @param  {Boolean} isNowCollapsed Whether or not the child is now collapsed.
   */
  childCollapseChanged(field, isNowCollapsed) {}

  /**
   * Toggle the collapse status of this field.
   */
  toggleCollapse() {
    this.setCollapsed(!this.collapsed);
  }

  /**
   * Set the collapse status of this field.
   */
  setCollapsed(collapsed) {
    if (this.isCollapsible) {
      this.collapsed = collapsed;
      if (this.parent) {
        this.parent.childCollapseChanged(this, this.collapsed);
      }
    }
  }

  /**
   * @inheritdoc
   * @param {Boolean} [args.collapsed]     Whether or not the UI element should
   *                                       be collapsed by default.
   * @param {Boolean} [args.isCollapsible] Whether or not this field should be
   *                                       collapsible.
   */
  init(id = '', args = {}) {
    args = Object.assign({
      collapsed: false,
      isCollapsible: true
    }, args);
    this.collapsed = args.collapsed;
    this.isCollapsible = args.isCollapsible;
    return super.init(id, args);
  }
}
