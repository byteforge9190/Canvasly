import { describe, it, expect } from 'vitest';
import type {
  ComponentDefinition,
  PropertySchema,
  PropertyType,
  SelectOption,
  LinkValue,
  ValidationRule,
  VisibilityCondition,
  PropertyUIConfig,
} from './schema';

describe('Schema Types', () => {
  describe('ComponentDefinition', () => {
    it('should validate a complete ComponentDefinition with valid input', () => {
      const validDefinition: ComponentDefinition = {
        type: 'test-component',
        name: 'Test Component',
        category: 'layout',
        icon: 'Square',
        acceptsChildren: true,
        allowedChildTypes: ['text', 'button'],
        maxChildren: 5,
        frameSchema: {
          sections: [
            {
              domain: 'layout',
              label: 'Layout',
              schemas: [
                {
                  key: 'direction',
                  label: 'Direction',
                  type: 'select',
                  defaultValue: 'vertical',
                  domain: 'layout',
                  path: 'direction',
                },
              ],
            },
          ],
        },
      };

      expect(validDefinition.type).toBe('test-component');
      expect(validDefinition.name).toBe('Test Component');
      expect(validDefinition.category).toBe('layout');
      expect(validDefinition.acceptsChildren).toBe(true);
      expect(validDefinition.allowedChildTypes).toEqual(['text', 'button']);
      expect(validDefinition.maxChildren).toBe(5);
      expect(validDefinition.frameSchema?.sections).toHaveLength(1);
    });

    it('should validate ComponentDefinition with minimal required fields', () => {
      const minimalDefinition: ComponentDefinition = {
        type: 'minimal',
        name: 'Minimal',
        category: 'ui',
        icon: 'Circle',
        acceptsChildren: false,
      };

      expect(minimalDefinition.type).toBe('minimal');
      expect(minimalDefinition.acceptsChildren).toBe(false);
    });

    it('should validate ComponentDefinition for all category types', () => {
      const categories: Array<ComponentDefinition['category']> = [
        'layout',
        'ui',
        'media',
        'interactive',
        'data',
      ];

      categories.forEach((category) => {
        const definition: ComponentDefinition = {
          type: `${category}-component`,
          name: `${category} Component`,
          category,
          icon: 'Icon',
          acceptsChildren: false,
        };

        expect(definition.category).toBe(category);
      });
    });

    it('should handle ComponentDefinition without optional fields', () => {
      const definition: ComponentDefinition = {
        type: 'simple',
        name: 'Simple',
        category: 'ui',
        icon: 'Star',
        acceptsChildren: false,
      };

      expect(definition.allowedChildTypes).toBeUndefined();
      expect(definition.maxChildren).toBeUndefined();
    });
  });

  describe('PropertySchema', () => {
    it('should validate PropertySchema with all property types', () => {
      const propertyTypes: PropertyType[] = [
        'string',
        'number',
        'boolean',
        'color',
        'select',
        'multiselect',
        'image',
        'video',
        'link',
        'richtext',
        'spacing',
        'icon',
        'json',
        'array',
      ];

      propertyTypes.forEach((type) => {
        const schema: PropertySchema = {
          key: `test-${type}`,
          label: `Test ${type}`,
          type,
          defaultValue: type === 'boolean' ? false : type === 'number' ? 0 : '',
        };

        expect(schema.type).toBe(type);
        expect(schema.key).toBe(`test-${type}`);
      });
    });

    it('should validate PropertySchema with validation rules', () => {
      const schema: PropertySchema = {
        key: 'email',
        label: 'Email',
        type: 'string',
        defaultValue: '',
        validation: [
          {
            type: 'required',
            message: 'Email is required',
          },
          {
            type: 'pattern',
            value: '^[^@]+@[^@]+\\.[^@]+$',
            message: 'Invalid email format',
          },
        ],
      };

      expect(schema.validation).toHaveLength(2);
      expect(schema.validation?.[0].type).toBe('required');
      expect(schema.validation?.[1].type).toBe('pattern');
    });

    it('should validate PropertySchema with visibility conditions', () => {
      const schema: PropertySchema = {
        key: 'iconPosition',
        label: 'Icon Position',
        type: 'select',
        defaultValue: 'left',
        showWhen: {
          key: 'icon',
          operator: 'exists',
        },
      };

      expect(schema.showWhen).toBeDefined();
      expect(schema.showWhen?.key).toBe('icon');
      expect(schema.showWhen?.operator).toBe('exists');
    });

    it('should validate PropertySchema with UI configuration', () => {
      const schema: PropertySchema = {
        key: 'size',
        label: 'Size',
        type: 'select',
        defaultValue: 'md',
        ui: {
          placeholder: 'Select size',
          helpText: 'Choose component size',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
      };

      expect(schema.ui?.placeholder).toBe('Select size');
      expect(schema.ui?.helpText).toBe('Choose component size');
      expect(schema.ui?.options).toHaveLength(3);
    });

    it('should validate PropertySchema with array type configuration', () => {
      const schema: PropertySchema = {
        key: 'items',
        label: 'Items',
        type: 'array',
        defaultValue: [],
        ui: {
          itemLabel: 'Item',
          addButtonText: 'Add Item',
          collapsible: true,
          reorderable: true,
          maxItems: 10,
        },
        itemSchema: [
          {
            key: 'title',
            label: 'Title',
            type: 'string',
            defaultValue: '',
          },
        ],
      };

      expect(schema.type).toBe('array');
      expect(schema.ui?.itemLabel).toBe('Item');
      expect(schema.ui?.maxItems).toBe(10);
      expect(schema.itemSchema).toHaveLength(1);
    });
  });

  describe('LinkValue', () => {
    it('should validate LinkValue for page type', () => {
      const link: LinkValue = {
        type: 'page',
        pageId: 'page-123',
        openInNewTab: false,
      };

      expect(link.type).toBe('page');
      expect(link.pageId).toBe('page-123');
      expect(link.openInNewTab).toBe(false);
    });

    it('should validate LinkValue for url type', () => {
      const link: LinkValue = {
        type: 'url',
        url: 'https://example.com',
        openInNewTab: true,
        rel: 'noopener noreferrer',
      };

      expect(link.type).toBe('url');
      expect(link.url).toBe('https://example.com');
      expect(link.openInNewTab).toBe(true);
      expect(link.rel).toBe('noopener noreferrer');
    });

    it('should validate LinkValue for email type', () => {
      const link: LinkValue = {
        type: 'email',
        email: 'test@example.com',
        subject: 'Hello',
      };

      expect(link.type).toBe('email');
      expect(link.email).toBe('test@example.com');
      expect(link.subject).toBe('Hello');
    });

    it('should validate LinkValue for phone type', () => {
      const link: LinkValue = {
        type: 'phone',
        phone: '+1234567890',
      };

      expect(link.type).toBe('phone');
      expect(link.phone).toBe('+1234567890');
    });

    it('should validate LinkValue for anchor type', () => {
      const link: LinkValue = {
        type: 'anchor',
        anchor: '#section-1',
      };

      expect(link.type).toBe('anchor');
      expect(link.anchor).toBe('#section-1');
    });
  });

  describe('ValidationRule', () => {
    it('should validate required validation rule', () => {
      const rule: ValidationRule = {
        type: 'required',
        message: 'This field is required',
      };

      expect(rule.type).toBe('required');
      expect(rule.message).toBe('This field is required');
    });

    it('should validate min/max validation rules', () => {
      const minRule: ValidationRule = {
        type: 'min',
        value: 5,
        message: 'Minimum value is 5',
      };

      const maxRule: ValidationRule = {
        type: 'max',
        value: 100,
        message: 'Maximum value is 100',
      };

      expect(minRule.type).toBe('min');
      expect(minRule.value).toBe(5);
      expect(maxRule.type).toBe('max');
      expect(maxRule.value).toBe(100);
    });

    it('should validate pattern validation rule', () => {
      const rule: ValidationRule = {
        type: 'pattern',
        value: '^[A-Z]',
        message: 'Must start with uppercase letter',
      };

      expect(rule.type).toBe('pattern');
      expect(rule.value).toBe('^[A-Z]');
    });

    it('should validate custom validation rule', () => {
      const rule: ValidationRule = {
        type: 'custom',
        validator: 'validateCustomField',
        message: 'Custom validation failed',
      };

      expect(rule.type).toBe('custom');
      expect(rule.validator).toBe('validateCustomField');
    });
  });

  describe('VisibilityCondition', () => {
    it('should validate visibility condition with eq operator', () => {
      const condition: VisibilityCondition = {
        key: 'variant',
        operator: 'eq',
        value: 'primary',
      };

      expect(condition.operator).toBe('eq');
      expect(condition.value).toBe('primary');
    });

    it('should validate visibility condition with exists operator', () => {
      const condition: VisibilityCondition = {
        key: 'icon',
        operator: 'exists',
      };

      expect(condition.operator).toBe('exists');
      expect(condition.value).toBeUndefined();
    });

    it('should validate all visibility condition operators', () => {
      const operators: Array<VisibilityCondition['operator']> = ['eq', 'neq', 'contains', 'exists'];

      operators.forEach((operator) => {
        const condition: VisibilityCondition = {
          key: 'testKey',
          operator,
          value: operator !== 'exists' ? 'testValue' : undefined,
        };

        expect(condition.operator).toBe(operator);
      });
    });
  });

  describe('SelectOption', () => {
    it('should validate SelectOption with string value', () => {
      const option: SelectOption = {
        label: 'Small',
        value: 'sm',
      };

      expect(option.label).toBe('Small');
      expect(option.value).toBe('sm');
      expect(typeof option.value).toBe('string');
    });

    it('should validate SelectOption with number value', () => {
      const option: SelectOption = {
        label: 'Priority 1',
        value: 1,
      };

      expect(option.label).toBe('Priority 1');
      expect(option.value).toBe(1);
      expect(typeof option.value).toBe('number');
    });
  });

  describe('PropertyUIConfig', () => {
    it('should validate PropertyUIConfig with all fields', () => {
      const config: PropertyUIConfig = {
        placeholder: 'Enter value',
        helpText: 'This is help text',
        min: 0,
        max: 100,
        step: 5,
        rows: 4,
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      };

      expect(config.placeholder).toBe('Enter value');
      expect(config.helpText).toBe('This is help text');
      expect(config.min).toBe(0);
      expect(config.max).toBe(100);
      expect(config.step).toBe(5);
      expect(config.rows).toBe(4);
      expect(config.options).toHaveLength(2);
    });

    it('should validate PropertyUIConfig with array-specific fields', () => {
      const config: PropertyUIConfig = {
        itemLabel: 'List Item',
        addButtonText: 'Add New',
        collapsible: true,
        reorderable: true,
        maxItems: 20,
        maxDepth: 3,
      };

      expect(config.itemLabel).toBe('List Item');
      expect(config.addButtonText).toBe('Add New');
      expect(config.collapsible).toBe(true);
      expect(config.reorderable).toBe(true);
      expect(config.maxItems).toBe(20);
      expect(config.maxDepth).toBe(3);
    });
  });
});
