We will build a page for logging manager and employee discussions and growth tracking.  The page has a two-column layout, with the left column fixed at 480px wide. The left column will contain two sections stacked vertically: 

- “action-items” (@https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4158-542\&m=dev), followed by “goals”(@https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4158-573\&m=dev). The right column should expand to fill the screen.    
- The right column has one section for “agenda”

Main component defined here: @[https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4159-684\&m=dev](https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1_Base?node-id=4159-684&m=dev) 

- There are variables to control padding for the page margins for sides, top, and bottom called margin-top, margin-sides, margin-bottom.  
- Subcomponents: Strictly adhere to these components as part of a design system.  Do not modify them without considering their broader use and implications. Do not modify them without requesting permission from the author.  Build these out as reusable components first, then implement them in the context of this page.  

## General:

- For the purpose of this document, the developer will be referred to as the “author” and the end user will be referred to as the “user”.  
- Font selection: There will be two font options available to the user, text-header-font-face and text-body-font-face. Tie into the Google Fonts API, and add the font list into a pair of dropdown menus, one for each.  Display the font names in their font face.  When selected, replace the variables text-header-font-face and text-header-font-face with the corresponding selection.  
- Variables: design tokens are defined here: . These are used for style properties of all components. If a component is missing a design token, alert the author so that it may be added.  
- Users with admin access should be able to create new instances of this page, and share a link to allow other users to access and modify it.  Example: A manager can create a new instance of this page, and share a password-protected link with an employee. Both parties can modify the page contents and both parties can recall and update login credentials for the employee instance.    
- There is an “add item” UI in each component that allows users to insert a new line item for the component directly below the UI, appending it to the top of the existing stack.

## Action Items:

Component can be seen here: @[https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4158-542\&m=dev](https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1_Base?node-id=4158-542&m=dev)

This component has a header, an “add item” UI and stack of “action-item” instances. “action-item” allows users to update a text string (“item-text”), and toggle a check box on/off to indicate task completion. There is an optional variant that includes a due date that can be enabled in the settings. There will be a settings option to toggle visibility on completed tasks, delete an instance of “action-item” and show/hide a “due” label with an editable date text.  Users may press on a text block to modify the text in each instance.

## Goals:

Component can be seen here: @[https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4158-573\&m=dev](https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1_Base?node-id=4158-573&m=dev)

This component has a header, and a pair of child components containing a subheader, an “add item” UI, and instances of a “goal” component.  The sections behave the same.  Users may press instances of the text area (“goal-text”) to modify the text strings, and press on a progress bar (“progress”) to increment it.  Once the progress bar is filled, an additional press will reset it, allowing the user to fill it again. 

## Agenda:

Component can be seen here:   
@[https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1\_Base?node-id=4188-709\&m=dev](https://www.figma.com/design/yLoM56mVPrxu2czhbZcPSY/JHF-1-1_Base?node-id=4188-709&m=dev)

This component has a header, an “add item” UI, and a series of child component instances (“agenda-entry”) that consist of three elements:  A Notes section, and two Agenda sections.  The Notes section has a text area for the date (“notes-date”), and a text area for live notetaking during a meeting (“notes-text”). The Agenda components are two instances of “Agenda”, one for an IC and one for a Manager. They consist of a header with the IC/Manager name set in the design tokens followed by a label that says “Agenda”, and below is an empty bullet list (“agenda-text”)  Users may press to update any of these fields.

When pressed, the “add item” UI allows users to append a new instance of “agenda-entry” to the top of the existing stack.

## Admin Panel

There will be a panel available with two levels of access.

- General access: has UI allowing all users to:  
  - override variable properties locally to enable custom user styling  
- Admin access: allows admin users:  
  - to create new page instances  
  - recall/reset non-admin login credentials   
  - fetch AI summaries of page contents  
  - Adjust panel settings like show/hide due dates and show/hide completed tasks  
  


  

